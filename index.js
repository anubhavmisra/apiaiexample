var express = require('express');
var stringify = require('json-stringify');

var app = express();

app.post('/api/weather', function(req, res) {
  // Get the city and date from the request
  var city = req.body.result.parameters['geo-city']; // city is a required param
  // Get the date for the weather forecast (if present)
  console.log(req);
  var date = '';
  if (req.query.date) {
    date = req.query.date;
    console.log('Date: ' + date);
  }
  var response = 'Server says that weather for ' + city + ' on ' + date + ' is unknown.'; //Default response from the webhook to show it's working
  
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(stringify({ "speech": response, "displayText": response
  //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
});

app.listen(process.env.PORT || 3001);