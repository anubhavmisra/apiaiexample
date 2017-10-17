var express = require('express');
var stringify = require('json-stringify');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//const dialogflowClientKey = process.env.DF_CLIENT_KEY || 'XXtestXX';

function callSearch(query){
  return new Promise((resolve, reject) => {
    var options =  {
        uri: 'http://milkbasket.com/products/search',
        body: JSON.stringify({"search_text": query}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(options, function (error, response) {
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(response.body));
      } else {
        reject(error);
      }
    });
  });
}


app.post('/api/order', function(req, res) {
  // Get the city and date from the request
  console.log(req.body);
  var product = req.body.result.parameters['product']; // product is a required param
  var quantity = req.body.result.parameters['quantity'];
  //var brand = req.body.result.parameters['brand']; // brand is a required param

  callSearch(product).then((output) => {
    if(output.data.length > 1){
      var response = 'I have found multiple products.';
      var productNames = output.data.map(function(product, index, array){
        return (index + 1) + '. ' +  product.nm;
      });

      //"followupEvent" to send the user to the next step
      var responseJson = stringify({ "speech": response, "displayText": response, "followupEvent": {
        "name": "product_multiple_results",
        "data": {
           "products":productNames.slice(0,3)
        }
      }});
    } else if (output.data.length == 1){
      //TODO: add this product to the basket

      //"speech" is the spoken version of the response, "displayText" is the visual version
      //Default response: show added product name
      var response = 'I have added \'' + output.data[0].nm + '\' to your basket(Not really).';
      var responseJson = stringify({ "speech": response, "displayText": response});
    } else if (output.data.length < 1){
      //Default response: no results
      var response = 'I could not find any results for ' + product + '.';
      var responseJson = stringify({ "speech": response, "displayText": response});
    }

    res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
    res.send(responseJson);
  }).catch((error) => {
    console.log(error);
    // If there is an error let the user know
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
  });


});

app.listen(process.env.PORT || 3001);
