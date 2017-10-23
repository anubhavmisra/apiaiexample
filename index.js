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
  console.log(req.body);

  //switch up logic based on "action" parameter
  var action = req.body.result.action;
  if(action === 'MultipleResults-selectnumber'){
    handleSelectNumber(req, res);

  } else {
    //Searching for a product is the default behaviour
    handleProductSearch(req, res);
  }
});

function handleSelectNumber(req, res){
  var selectedNumber =  req.body.result.parameters['selectedNumber'];
  var products = req.body.result.contexts[0].parameters['products'];
  var selectedProduct = products[selectedNumber - 1].slice(2);
  callSearch(selectedProduct).then((output) => {
    if (output.data.length == 1){
      //TODO: add this product to the basket

      //"speech" is the spoken version of the response, "displayText" is the visual version
      //Default response: show added product name
      var response = 'I have added \'' + output.data[0].nm + '\' to your basket(Not really).';
      var responseJson = stringify({ "speech": response, "displayText": response});
    } else {
      //FIXME We do not like this case. The product should be found by the select
      var response = 'There are an unexpected number of results for ' + selectedProduct + '.';
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
}

function handleProductSearch(req, res){
  var product = req.body.result.parameters['product']; // product is a required param
  //var quantity = req.body.result.parameters['quantity'];

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
}

app.listen(process.env.PORT || 3001);
