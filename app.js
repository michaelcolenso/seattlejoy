var express = require('express');
var compression = require('compression');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

/**
 * GET /
 * Home page — the map.
 */
app.get('/', function(req, res) {
  res.render('home', { title: 'Seattle $1M+ Sales' });
});

/**
 * GET /api/property/:pin
 * Proxy to King County Assessor — returns property image + specs.
 */
app.get('/api/property/:pin', function(req, res, next) {
  var pin = req.params.pin;
  var url = 'http://info.kingcounty.gov/Assessor/eRealProperty/Dashboard.aspx?ParcelNbr=' + pin;

  request.get(url, function(err, response, body) {
    if (err) return next(err);

    var $ = cheerio.load(body);
    var imgSrc = $('#kingcounty_gov_cphContent_FormViewPictCurr_CurrentImage').attr('src');
    var details = [];
    $('td', '#kingcounty_gov_cphContent_DetailsViewPropTypeR').each(function() {
      details.push($(this).text().trim());
    });

    res.json({
      imageUrl: imgSrc
        ? 'http://info.kingcounty.gov/Assessor/eRealProperty/' + imgSrc
        : null,
      yearBuilt:  details[1] || null,
      sqft:       details[3] || null,
      beds:       details[5] || null,
      baths:      details[7] || null,
      grade:      details[9] || null,
      condition:  details[11] || null
    });
  });
});

app.use(errorHandler());

app.listen(app.get('port'), function() {
  console.log('SeattleJoy listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
