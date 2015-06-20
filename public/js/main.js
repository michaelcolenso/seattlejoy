$(document).ready(function() {

  var Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  });

  var aerialKC2013 = L.esri.tiledMapLayer("https://gismaps.kingcounty.gov/arcgis/rest/services/BaseMaps/KingCo_Aerial_2013/MapServer", {
    minZoom: 0,
    maxZoom: 20,
    attribution: 'Tiles Courtesy of <a href="https://www.kingcounty.gov/operations/GIS.aspx">King County GIS Center</a>',

  });

  var aerialKC1936 = L.esri.tiledMapLayer("https://gismaps.kingcounty.gov/arcgis/rest/services/BaseMaps/KingCo_Aerial_1936/MapServer", {
    minZoom: 0,
    maxZoom: 20,
    attribution: 'Tiles Courtesy of <a href="https://www.kingcounty.gov/operations/GIS.aspx">King County GIS Center</a>',

  });

  var houses = L.esri.featureLayer('https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer/3', {
   where: "SalePrice > 1000000 AND Principal_Use = 'RESIDENTIAL'",
   style: function (feature) {
     if(feature.properties.Principal_Use === 'RESIDENTIAL'){
       return {
         color: '#BD1550',
         weight: 4,
         fillColor: 'rgba(0,0,0,0.0)'

          };
     }
   }

 });

  var baseMaps = {
    "Stamen Toner Lite": Stamen_TonerLite,
    "King County Aerial [2013]": aerialKC2013,
    "King County Aerial [1936]": aerialKC1936
  };

  var sidebar = L.control.sidebar('sidebar', {
      closeButton: true,
      position: 'right'
  });

  var layerControl = L.control.layers(baseMaps);
  layerControl.setPosition('bottomleft');


  var southWest = L.latLng(47.4949723847, -122.4937073234),
  northEast = L.latLng(47.7381413304, -121.9732332793),
  bounds = L.latLngBounds(southWest, northEast),
  center = bounds.getCenter();

  var map = L.map('map', {
    center: center,
    maxBounds: bounds,
    zoom: 12,
    layers: [Stamen_TonerLite]
    })
  .addControl(layerControl);
  map.addControl(sidebar);

  var parcels = L.esri.dynamicMapLayer('https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer', {
     opacity: 0.2,
     position: 'back',
     useCors: false
  });

   parcels.addTo(map);
   houses.addTo(map);

   var identifiedFeature;
   var pane = document.getElementById('selectedFeatures');
   var details = document.getElementById('propertyDetails');
   var logo;

   function animateIcon() {

     return logo;
   }

   function renderImage(url) {
     $('#featuredImage').css( {
        'background-image': 'url("' + url + '")'
      });
   };

   function renderDetails(details) {
     return L.Util.template('<div class="detailContainer"><div class="flex"> <div>{totalSquareFootage}<div class="propertyLabel">sq. ft.</div></div> <div>{beds}<div class="propertyLabel">bedrooms</div></div> <div>{baths}<div class="propertyLabel">bathrooms</div></div> <div>{yearBuilt}<div class="propertyLabel">year built</div></div></div> </div>', details);
   };

   function getImage(pin) {
     $.get("/api/images/" + pin + "", function (data) {
     function render () {
       renderImage(data.propertyDetails.imageUrl);
       details.innerHTML = renderDetails(data.propertyDetails);
       console.log(data.propertyDetails);
     };

     render();

     });
   };


   function getPane(featureCollection) {
     var sale_date = moment(featureCollection.features[0].properties.SaleDate).fromNow();
     var sale_price = numeral(featureCollection.features[0].properties.SalePrice).format('$ 0,0[.]00');
     var pin = featureCollection.features[0].properties.PIN;
     getImage(pin);

     return L.Util.template(
         '<div class="headlineContainer"><h1 id="headline"><span class="addr">{FullAddr}</span> sold for&nbsp;<br><span class="price">' + sale_price + '</span><br>&nbsp;about&nbsp;<span class="when">' + sale_date + '</span></h1></div>', featureCollection.features[2].properties);

   };

   houses.on('click', function (e) {
    if(identifiedFeature){
      map.removeLayer(identifiedFeature);
      pane.innerHTML = 'Loading';

    } else { sidebar.toggle();}
    parcels.identify().on(map).at(e.latlng).run(function(error, featureCollection){
      if (featureCollection.features.length > 0){
        identifiedFeature = new L.GeoJSON(featureCollection.features[0], {
          style: function(){
            return {
              color: '#3be579',
              weight: 8,
              opacity: 1,
              fillOpacity: 0
            };
          }
        }).addTo(map);



        pane.innerHTML = getPane(featureCollection);
        sidebar.show();
        $(".price").fitText(1.2, { minFontSize: '60px', maxFontSize: '80px' });
      }
    });
  });

  $("#featuredImage").on("click", function() {
    var visible = sidebar.isVisible();
    if (!visible) {
      sidebar.show();
    } else {
      sidebar.hide();
    }
  });

});
