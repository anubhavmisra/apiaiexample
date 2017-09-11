var express = require('express');
var stringify = require('json-stringify');

var app = express();

app.get('/api/weather', function(req, res) {
  var response = 'This is a sample response from your webhook!'; //Default response from the webhook to show it's working

  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(stringify({ "speech": response, "displayText": response
  //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
});

app.listen(process.env.PORT || 3001);