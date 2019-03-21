var express = require('express');
var app = express();
var bodyParser = require('body-parser');
 

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function (req, res) {
   res.send('This is the backend of Stock-Search Web Application created by Lu Xie.');
})

app.get('/hw8.html', function (req, res) {
   res.sendFile( __dirname + "/" + "hw8.html" );
})
 
app.get('/symbol_get', function (req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
 	var request = require('request');
 	var symbol = req.query.symbol;
  var size = req.query.size;
 	var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+symbol+'&outputsize='+size+'&apikey=8NJ5D0PJN6LLJGE0';
	request.get(url, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
        	res.send(body);
    	}
	});
})

app.get('/indicator_get', function (req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
 	var request = require('request');
 	var symbol = req.query.symbol;
 	var fun = req.query.fun;
 	var url = "https://www.alphavantage.co/query?function="+fun+"&symbol="+symbol+"&interval=daily&time_period=10&series_type=close&apikey=8NJ5D0PJN6LLJGE0";
	request.get(url, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
        	res.send(body);
    	}
	});
})

app.get('/news_get', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  var request = require('request');
  var symbol = req.query.symbol;
  var url = 'https://seekingalpha.com/api/sa/combined/'+symbol+'.xml';
  request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var parseString = require('xml2js').parseString;
          parseString(body, function (err, result) {
          res.send(JSON.stringify(result));
        });
      }
  });
})

app.get('/input_get', function (req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
 	var request = require('request');
 	var input = req.query.input;
 	var url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input="+input;
	request.get(url, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
        	res.send(body);
    	}
	});
})

app.post('/url_get', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  var request = require('request');
  var options = {  
          url: 'http://export.highcharts.com',
          form: {
              options: req.body['key'],
              filename: 'Chart',
              type: 'image/png',
              async: true
          }
      };
  request.post(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          res.send(body);
      }
  });
})

var server = app.listen(8081);
