(function () {
  'use strict';

  // --- Date filter: last 12 months (epoch milliseconds for ESRI date fields) ---
  var oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  var dateEpoch = oneYearAgo.getTime();

  // --- Price tiers ---
  function priceColor(price) {
    if (price >= 5000000) return '#6d0000';
    if (price >= 3000000) return '#bd1550';
    if (price >= 2000000) return '#e84545';
    if (price >= 1500000) return '#f4845f';
    return '#f9c784';
  }

  function priceRadius(price) {
    if (price >= 5000000) return 10;
    if (price >= 3000000) return 8;
    if (price >= 2000000) return 7;
    if (price >= 1500000) return 6;
    return 5;
  }

  // --- Map ---
  var bounds = L.latLngBounds(
    L.latLng(47.40, -122.55),
    L.latLng(47.80, -121.90)
  );

  var map = L.map('map', {
    center: bounds.getCenter(),
    zoom: 11,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  });

  // CartoDB Positron — no API key required
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a> | ' +
        'Sales data: <a href="https://www.kingcounty.gov/">King County GIS</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }
  ).addTo(map);

  // King County parcel outlines (background reference, low opacity)
  L.esri.dynamicMapLayer({
    url: 'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer',
    layers: [0],
    opacity: 0.15,
    useCors: false
  }).addTo(map);

  // --- Sidebar ---
  var sidebar = document.getElementById('sidebar');
  var featuredImage = document.getElementById('featured-image');
  var propertySummary = document.getElementById('property-summary');
  var propertySpecs = document.getElementById('property-specs');
  var statsLabel = document.getElementById('stats-label');

  function showSidebar() { sidebar.classList.remove('collapsed'); }
  function hideSidebar() { sidebar.classList.add('collapsed'); }

  document.getElementById('sidebar-close').addEventListener('click', hideSidebar);

  // --- Track highlighted parcel ---
  var highlightLayer = null;

  // --- Sales layer: $1M+ residential sold in the last 12 months ---
  var salesWhere =
    "SalePrice > 1000000 AND Principal_Use = 'RESIDENTIAL' AND SaleDate >= " + dateEpoch;

  var allPrices = [];

  var salesLayer = L.esri.featureLayer({
    url: 'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer/3',
    where: salesWhere,
    pointToLayer: function (feature, latlng) {
      var price = feature.properties.SalePrice;
      return L.circleMarker(latlng, {
        radius:      priceRadius(price),
        fillColor:   priceColor(price),
        color:       '#fff',
        weight:      1,
        opacity:     0.9,
        fillOpacity: 0.85
      });
    }
  });

  // Collect prices for stats once features load
  salesLayer.on('load', function () {
    allPrices = [];
    salesLayer.eachFeature(function (layer) {
      allPrices.push(layer.feature.properties.SalePrice);
    });
    updateStats();
  });

  function updateStats() {
    if (!allPrices.length) {
      statsLabel.textContent = 'No sales found for this period.';
      return;
    }
    var sorted = allPrices.slice().sort(function (a, b) { return a - b; });
    var median = sorted[Math.floor(sorted.length / 2)];
    statsLabel.innerHTML =
      '<strong>' + allPrices.length + '</strong> homes sold over $1M in the last 12 months &nbsp;|&nbsp; ' +
      'Median: <strong>' + numeral(median).format('$0,0') + '</strong>';
  }

  salesLayer.addTo(map);

  // --- Parcels identify layer for parcel outline on click ---
  var parcelsIdentify = L.esri.dynamicMapLayer({
    url: 'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer',
    opacity: 0,
    useCors: false
  }).addTo(map);

  // --- Click handler ---
  salesLayer.on('click', function (e) {
    var props = e.layer.feature.properties;
    var price = props.SalePrice;
    var saleDate = props.SaleDate;
    var pin = props.PIN;
    var address = [props.SitusStreet, props.SitusCity]
      .filter(Boolean).join(', ') || 'King County Property';

    // Highlight the clicked parcel outline
    if (highlightLayer) {
      map.removeLayer(highlightLayer);
      highlightLayer = null;
    }

    parcelsIdentify.identify()
      .on(map)
      .at(e.latlng)
      .run(function (err, featureCollection) {
        if (!err && featureCollection && featureCollection.features.length > 0) {
          highlightLayer = L.geoJSON(featureCollection.features[0], {
            style: {
              color: '#3be579',
              weight: 6,
              opacity: 1,
              fillOpacity: 0
            }
          }).addTo(map);
        }
      });

    // Populate sidebar summary
    featuredImage.style.backgroundImage = '';
    featuredImage.style.backgroundColor = '#1a1a2e';
    propertySummary.innerHTML =
      '<div class="prop-address">' + address + '</div>' +
      '<div class="prop-price">' + numeral(price).format('$0,0') + '</div>' +
      '<div class="prop-date">Sold ' + moment(saleDate).fromNow() + '</div>';
    propertySpecs.innerHTML = '<div class="loading">Loading details\u2026</div>';

    showSidebar();

    // Fetch property details from our server proxy
    if (pin) {
      fetch('/api/property/' + pin)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.imageUrl) {
            featuredImage.style.backgroundImage = 'url("' + d.imageUrl + '")';
          }
          propertySpecs.innerHTML =
            specRow('Sq Ft', d.sqft) +
            specRow('Beds', d.beds) +
            specRow('Baths', d.baths) +
            specRow('Year Built', d.yearBuilt) +
            specRow('Grade', d.grade) +
            specRow('Condition', d.condition);
        })
        .catch(function () {
          propertySpecs.innerHTML = '';
        });
    }
  });

  function specRow(label, value) {
    if (!value) return '';
    return '<div class="spec-row">' +
      '<span class="spec-label">' + label + '</span>' +
      '<span class="spec-value">' + value + '</span>' +
      '</div>';
  }

  // --- Legend ---
  var legendEl = document.createElement('div');
  legendEl.id = 'legend';
  legendEl.innerHTML =
    '<div><span class="legend-dot" style="background:#f9c784"></span>$1M&ndash;$1.5M</div>' +
    '<div><span class="legend-dot" style="background:#f4845f"></span>$1.5M&ndash;$2M</div>' +
    '<div><span class="legend-dot" style="background:#e84545"></span>$2M&ndash;$3M</div>' +
    '<div><span class="legend-dot" style="background:#bd1550"></span>$3M&ndash;$5M</div>' +
    '<div><span class="legend-dot" style="background:#6d0000"></span>$5M+</div>';
  document.body.appendChild(legendEl);

  // Click map background to close sidebar
  map.on('click', function (e) {
    if (e.originalEvent.target.id === 'map') {
      hideSidebar();
      if (highlightLayer) {
        map.removeLayer(highlightLayer);
        highlightLayer = null;
      }
    }
  });

}());
