var express = require('express');
var stringify = require('json-stringify');
var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var app = express();

app.post('/api/weather', function(req, res) {
  // Get the city and date from the request
  console.log(req.body);
  var city = req.body.result.parameters['geo-city']; // city is a required param

  var response = 'Server says that weather for ' + city + ' is unknown.'; //Default response from the webhook to show it's working
  
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(stringify({ "speech": response, "displayText": response
  //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
});

app.listen(process.env.PORT || 3001);