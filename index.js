var express = require('express');
var stringify = require('json-stringify');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const http = require('http');
const host = 'api.worldweatheronline.com';
const wwoApiKey = '12a59414beec47c289875421172209';

function callWeatherApi (city, date) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
      '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
    console.log('API Request: ' + host + path);
    // Make the HTTP request to get the weather
    http.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        let forecast = response['data']['weather'][0];
        let location = response['data']['request'][0];
        let conditions = response['data']['current_condition'][0];
        let currentConditions = conditions['weatherDesc'][0]['value'];
        // Create response
        let output = `Current conditions in the ${location['type']}
        ${location['query']} are ${currentConditions} with a projected high of
        ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of
        ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on
        ${forecast['date']}.`;
        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}

app.post('/api/weather', (req, res) => {
  // Get the city and date from the request
  let city = req.body.result.parameters['geo-city']; // city is a required param
  // Get the date for the weather forecast (if present)
  let date = '';
  if (req.body.result.parameters['date']) {
    date = req.body.result.parameters['date'];
    console.log('Date: ' + date);
  }
  // Call the weather API
  callWeatherApi(city, date).then((output) => {
    // Return the results of the weather API to API.AI
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
  }).catch((error) => {
    // If there is an error let the user know
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
  });
});

app.post('/api/order', function(req, res) {
  // Get the city and date from the request
  console.log(req.body);
  var product = req.body.result.parameters['product']; // product is a required param
  var quantity = req.body.result.parameters['quantity'];
  //var brand = req.body.result.parameters['brand']; // brand is a required param
  //var response = 'I have added ' + product + ' to your basket(Not really).'; //Default response from the webhook to show it's working
  var response = 'I have found multiple products.';

  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(stringify({ "speech": response, "displayText": response
  //"speech" is the spoken version of the response, "displayText" is the visual version
  //"followupEvent" to send the user to the next step
    "followupEvent": {
      "name": "MultipleResults",
      "data": {
         "result1": "TestResult1",
         "result2": "TestResult2",
         "result3": "TestResult3"
      }
   }
  }));
});

app.listen(process.env.PORT || 3001);
