var request = require('request');
var parser = require('JSONStream').parse('features.*.attributes');
var db = process.env.MONGO_URL;

var options = { db: db, collection: 'sales' };
var streamToMongo = require('stream-to-mongo')(options);
console.log(db);
request("http://arcserver.tclp.org/arcgis/rest/services/City/CityParcelViewer/MapServer/2/query?where=objectid+%3D+objectid&outfields=*&f=json", function(err, req, res) {
  if (err) { console.log(err) }
  console.log(res);
});
console.log('got it bro');
