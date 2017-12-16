var app = angular.module('stock',['ngAnimate','ngMaterial','ui.toggle']);

app.controller('myCtrl', function($scope, $http, $interval, $timeout){
	localStorage.clear();
	$scope.slide = true;
	$scope.favor = true;
	$scope.share = true;
	$scope.right = true;
	$scope.autofresh = false;
	$scope.roles = [{name:"Default", value: "index"},{name:"Symbol", value: "name"},{name:"Price", value: "price"},{name:"Change", value: "CV"},{name:"Change Percent", value: "CP"},{name:"Volume", value: "VV"}];
    $scope.property = $scope.roles[0];
    $scope.sort = [{name:"Ascending", value: false}, {name:"Descending", value: true}]
    $scope.sequence = $scope.sort[0];
	changeFav();

	$scope.querySearch = function (query) {
      return $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/input_get?input="+query).then(function (response) {
        return convert(response.data);
      });
    }

	$scope.submitFun = function() {
		$scope.slide = false;
		$scope.right = false;
		submit($http, $scope.symbol);
	}
	
	$scope.touchFun = function() {
		$scope.touch = true;
	}

	$scope.rightFun = function() {
		$scope.slide = false;
	}

	$scope.left = function() {
		$scope.slide = true;
	}

	$scope.search = function(symbol) {
		$scope.slide = false;
		submit($http, symbol);
	}
	
	$scope.clear = function() {
		$scope.show = false;
		$scope.symbol = "";
		$scope.slide = true;
		$scope.right = true;
		$scope.myform.$setUntouched();
	};

	function judgeFun() {
		var judge = $('#'+shareIMG).children()[0].getAttribute("class");
		if (judge === "alert alert-danger" || judge === "progress") $scope.share = true;
		else {
			$scope.share = false;
		    var baseUrl = 'https://export.highcharts.com/';
		    $.post("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/url_get", {'key':JSON.stringify(jsonfiles[shareIMG])}, function(data) {
		        url = baseUrl + data;
		        images[shareIMG] = url;
		    });   
		}
	}

	function changeFav() {
		$scope.favoriteItem = new Array();
		for (var i = 0; i < localStorage.length; i++) {
	        $scope.favoriteItem[i] = JSON.parse(localStorage.getItem(localStorage.key(i)));
	    }
	}
    
    $scope.fresh = function() {
    	for (var i = 0; i < localStorage.length; i++) {
    		key = localStorage.key(i);
    		$http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/symbol_get?symbol="+key+"&size=compact").then(function (response) {
        		favor_day($scope, response.data);
        		changeFav();
        	});
    	}
    };

    var stop;
    $scope.autofresh = function() {
		if($scope.auto == true) {
			stop = $interval($scope.fresh, 5000);
		}
		else {
       		$interval.cancel(stop);
       		stop = undefined;
		}
    };
    
	$scope.sortFun = function() {
    	$scope.favoriteItem.reverse();
    }

	$scope.delByStar = function() {
    	localStorage.removeItem($scope.symbol);
    	changeFav();
    	$scope.show = localStorage.getItem($scope.symbol) == null;
    };

   
    $scope.delByTrash = function (id) {
		var parent = document.getElementById("info");
		var child = document.getElementById(id);
		parent.removeChild(child);
		localStorage.removeItem(id);
		$scope.show = localStorage.getItem($scope.symbol) == null;
	};

	$scope.changeIMG = function (IMG) {
		shareIMG = IMG;
		var judge = $('#'+IMG).children()[0].getAttribute("class");
		if (judge === "alert alert-danger" || judge === "progress") $scope.share = true;
		else {
			$scope.share = false;
		    var baseUrl = 'https://export.highcharts.com/';
		    $.post("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/url_get", {'key':JSON.stringify(jsonfiles[IMG])}, function(data) {
		        url = baseUrl + data;
		        images[IMG] = url;
		    });  
		}

	}

    function favor_day($scope, jsonObj) {

		var symbol = jsonObj["Meta Data"]["2. Symbol"];
		var daily = Object.keys(jsonObj["Time Series (Daily)"]);
		var latest = daily[0];
		var close = parseFloat(jsonObj["Time Series (Daily)"][latest]["4. close"]);
		var volume = parseInt(jsonObj["Time Series (Daily)"][latest]["5. volume"]);
		var yesterday = daily[1];
		var close2 = parseFloat(jsonObj["Time Series (Daily)"][yesterday]["4. close"]);
		var change = close - close2;
		var changeP = change*100 / close2;
		var img = "";

		if (change > 0) img = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png";
		else if (change < 0) img = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png";
		var dayChange = change.toFixed(2).toString()+" ("+changeP.toFixed(2).toString()+"%) ";
		var temp = {
				index: $scope.favoriteItem.length,
				name: symbol,
				price: close,
				PV: close.toFixed(2).toString(),
				change: dayChange,
				CV: Math.abs(change),
				CP: Math.abs(changeP),
				vol: volume.toLocaleString('en-US'),
				VV: volume,
				imgURL: img
			}
		localStorage.setItem(symbol,JSON.stringify(temp));
	}

	function submit($http, symbol) {
		$scope.touch = true;
		$scope.share = true;
		$scope.favor = true;
		$scope.show = localStorage.getItem(symbol) == null;
		$scope.symbol = symbol;
		document.getElementById("stockTable").innerHTML = "<br><br><br><div class='progress special'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("price").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";		
		document.getElementById("SMA").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("EMA").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("CCI").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("ADX").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("RSI").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("BBANDS").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("MACD").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("STOCH").innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("history").innerHTML = "<div class='progress special3'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";
		document.getElementById("news").innerHTML = "<div class='progress special3'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:50%'></div></div>";

		$http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/symbol_get?symbol="+symbol+"&size=compact").then(function (response) {
	    	generateInfo(response.data);
	        $scope.favor = false;
	        $scope.add = function() {
	    		favor_day($scope, response.data);
	  			changeFav();
	  			$scope.show = localStorage.getItem(symbol) == null;
	    	};
	        
	    }, function (response) {
	    	document.getElementById("stockTable").innerHTML = "<div class='alert alert-danger special2' role='alert'>Error! Failed to get current stock data.</div>";
	    });

		$http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/symbol_get?symbol="+symbol+"&size=full").then(function (response) {
	        chartPrice(response.data);
	        if (shareIMG === "price") judgeFun();
	    }, function (response) {
	    	document.getElementById("price").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get Price data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=SMA").then(function (response) {
	        chartIndicators(response.data, "SMA");
	        if (shareIMG === "SMA") judgeFun();
	    }, function (response) {
	    	document.getElementById("SMA").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get SMA data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=EMA").then(function (response) {
	        chartIndicators(response.data, "EMA");
	        if (shareIMG === "EMA") judgeFun();
	    }, function (response) {
	    	document.getElementById("EMA").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get EMA data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=STOCH").then(function (response) {
	        chartIndicators(response.data, "STOCH");
	        if (shareIMG === "STOCH") judgeFun();
	    }, function (response) {
	    	document.getElementById("STOCH").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get STOCH data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=RSI").then(function (response) {
	        chartIndicators(response.data, "RSI");
	        if (shareIMG === "RSI") judgeFun();
	    }, function (response) {
	    	document.getElementById("RSI").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get RSI data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=ADX").then(function (response) {
	        chartIndicators(response.data, "ADX");
	        if (shareIMG === "ADX") judgeFun();
	    }, function (response) {
	    	document.getElementById("ADX").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get ADX data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=CCI").then(function (response) {
	        chartIndicators(response.data, "CCI");
	        if (shareIMG === "CCI") judgeFun();
	    }, function (response) {
	    	document.getElementById("CCI").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get CCI data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=BBANDS").then(function (response) {
	        chartIndicators(response.data, "BBANDS");
	        if (shareIMG === "BBANDS") judgeFun();
	    }, function (response) {
	    	document.getElementById("BBANDS").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get BBANDS data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/indicator_get?symbol="+symbol+"&fun=MACD").then(function (response) {
	        chartIndicators(response.data, "MACD");
	        if (shareIMG === "MACD") judgeFun();
	    }, function (response) {
	    	document.getElementById("MACD").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get MACD data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/symbol_get?symbol="+symbol+"&size=full").then(function (response) {
	        chartHistory(response.data);
	    }, function (response) {
	    	document.getElementById("history").innerHTML = "<div class='alert alert-danger special2' role='alert'>Error! Failed to get History Price data.</div>";
	    });

	    $http.get("http://stocknodejs-env.us-west-1.elasticbeanstalk.com/news_get?symbol="+symbol).then(function (response) {
	       printNews(response.data);
	    }, function (response) {
	    	document.getElementById("news").innerHTML = "<div class='alert alert-danger special2' role='alert'>Error! Failed to get Stock News data.</div>";
	    });
	}
	
});




var shareIMG = "price";
window.fbAsyncInit = function() {
    FB.init({
      	appId: 494601584257250, 
      	xfbml: true,
      	autoLogAppEvents: true,
      	status: true,
      	version: 'v2.10'
    });
    
    document.getElementById('share').onclick = function() {

	    FB.ui({
			method: 'feed',
		    picture: images[shareIMG],
		}, function(response){
			if (response && !response.error_message) {
	            alert("Posted Successfully");
	        } else {
	            alert("Not Posted");
	        }
	   	});
	}
	
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var jsonfiles = {"price": "","SMA": "","EMA": "","CCI": "","ADX": "","STOCH": "","RSI": "","BBANDS": "","MACD": ""};
var images = {"price": "","SMA": "","EMA": "","CCI": "","ADX": "","STOCH": "","RSI": "","BBANDS": "","MACD": ""};

function convert(jsonObj) {
    var stocks = new Array();
    for (var i = 0; i < jsonObj.length; i++) {
        stocks[i] = {
	        value: jsonObj[i]["Symbol"] + " - " + jsonObj[i]["Name"] + " (" + jsonObj[i]["Exchange"] + ")",
	        display: jsonObj[i]["Symbol"]
	    }
    }
    return stocks;
}

function generateInfo(jsonObj) {
	if (Object.keys(jsonObj).length == 1) {
		document.getElementById("stockTable").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get current stock data.</div>";
		return;
	}
	var symbol = jsonObj["Meta Data"]["2. Symbol"];
	var daily = Object.keys(jsonObj["Time Series (Daily)"]);
	var latest = daily[0];
	var close = parseFloat(jsonObj["Time Series (Daily)"][latest]["4. close"]);

	var open = parseFloat(jsonObj["Time Series (Daily)"][latest]["1. open"]);
	var high = parseFloat(jsonObj["Time Series (Daily)"][latest]["2. high"]);
	var low = parseFloat(jsonObj["Time Series (Daily)"][latest]["3. low"]);
	var volume = parseInt(jsonObj["Time Series (Daily)"][latest]["5. volume"]).toLocaleString('en-US');

	var now = moment().tz("America/New_York");
	var min = parseInt(now.format("H"))*60+parseInt(now.format("m"));
	var yesterday = daily[1];
	var close2 = parseFloat(jsonObj["Time Series (Daily)"][yesterday]["4. close"]);
	var closeshow;
	if (now.format("YYYY-MM-DD") == moment(latest).format("YYYY-MM-DD") && min >= 570 && min <= 960) {
		timestamp = now.format("YYYY-MM-DD HH:mm:ss z");
		closeshow = close2;
	}
	else {
		timestamp = latest +" 16:00:00 "+ now.format("z");	
		closeshow = close;
	}
	
	
	var change = close - close2;
	var changeP = change*100 / close2;
	var img = "";
	if (change > 0) img = "<img width=17px height=17px src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png'>";
	else img = "<img width=17px height=17px src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png'>";
	var dayChange = change.toFixed(2).toString()+" ("+changeP.toFixed(2).toString()+"%) "+img;
	var table = "<table class='table table-striped' magin=1%><tr><td class='header'>Stock Ticker Symbol</td><td class='data'>"+symbol+"</td></tr><tr><td class='header'>Last Price</td><td class='data'>"+close.toFixed(2).toString()+"</td></tr><tr><td class='header'>Change (Change Percent)</td><td class='data'>"+dayChange+"</td></tr><tr><td class='header'>Timestamp</td><td class='data'>"+timestamp+"</td></tr><tr><td class='header'>Open</td><td class='data'>"+open.toFixed(2).toString()+"</td></tr><tr><td class='header'>Close</td><td class='data'>"+closeshow.toFixed(2).toString()+"</td></tr><tr><td class='header'>Day's Range</td><td class='data'>"+low.toFixed(2).toString()+" - "+high.toFixed(2).toString()+"</td></tr><tr><td class='header'>Volumn</td><td class='data'>"+volume.toString()+"</td></tr></table>";
	document.getElementById("stockTable").innerHTML = table;

}

function chartPrice(jsonObj) {
	if (Object.keys(jsonObj).length <= 1) {
		document.getElementById("price").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get Price data.</div>";
		return;
	}
	symbol = jsonObj["Meta Data"]["2. Symbol"];
	titleText = symbol + " Stock Price and Volume";
	rowData = jsonObj["Time Series (Daily)"];
	xdate = new Array();
	ydata1 = new Array();
	ydata2 = new Array();
	key = Object.keys(rowData);
	for (i = 0; i <= 130; i++) {
		xdate[i] = key[i].substr(5,2) + "/" + key[i].substr(8,2);
		ydata1[i] = parseFloat(rowData[key[i]]["4. close"]);
		ydata2[i] = parseFloat(rowData[key[i]]["5. volume"]);
	}
	xdate.reverse();
	ydata1.reverse();
	ydata2.reverse();
	var max2 = ydata2[0];
	for (var i = 1; i < ydata2.length; i++) {
    	max2 =  Math.max(max2, ydata2[i]);
	}
	var chart = {
		zoomType: 'x'
	}
	var title = {
		text: titleText
	}
	var subtitle = {
		useHTML: true,
		text: "<a href=https://www.alphavantage.co/ target=_blank>Source: Alpha Vantage</a>"
	}
	var xAxis = {
		tickLength: 4, 
		tickInterval: 5,
		categories: xdate, 
		labels: {
			rotation: 315, 
			style: {
				"font-size": 11
			}
		}
	}
	var yAxis = [
		{
				title: {
				text: "Stock Price",
			},
		},
		{
			title: {
					text: "Volume",
			},
			max: max2*1.3,
			opposite: true
		}
	]
	var plotOptions = {
			areaspline: {
			fillColor: "rgba(50,0,255,0.2)",
			lineColor: "rgb(50,0,255)",
				lineWidth: 1.5
		}
	}
	var series = [
			{
				name: "Price", 
					type: "areaspline", 
				color: "rgb(50,0,255)",
				data: ydata1
			},
				{
				name: "Volume", 
				type: "column", 
					color: "red",
				yAxis: 1,
				data: ydata2,
			}
		]
	var json = {};
	json.chart = chart;
	json.title = title;
	json.subtitle = subtitle;
	json.xAxis = xAxis;	
	json.yAxis = yAxis;
	json.plotOptions = plotOptions;
	json.series = series;
	$('#price').highcharts(json);
	jsonfiles["price"] = json;
}

function chartHistory(jsonObj) {
	if (Object.keys(jsonObj).length <= 1) {
		document.getElementById("history").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get History Price data.</div>";
		return;
	}
	symbol = jsonObj["Meta Data"]["2. Symbol"];
	titleText = symbol + " Stock Price and Volume";
	rowData = jsonObj["Time Series (Daily)"];
	data = new Array();
	key = Object.keys(rowData);
	for (i = 0; i < 1000; i++) {
		temp = new Array();
		temp[0] = moment(key[i]).unix()*1000;
		temp[1] = parseFloat(rowData[key[i]]["4. close"]);
		data[i] = temp; 
	}
	data.reverse();
		
    var rangeSelector = {
       	buttons: [{
			type: 'week',
			count: 1,
			text: '1w'
		}, {
			type: 'month',
			count: 1,
			text: '1m'
		}, {
			type: 'month',
			count: 3,
			text: '3m'
		}, {
			type: 'month',
			count: 6,
			text: '6m'
		}, {
			type: 'ytd',
			text: 'YTD'
		}, {
			type: 'year',
			count: 1,
			text: '1y'
		}, {
			type: 'all',
			text: 'All'
		}],
           selected : 0
    }
    var title = {
        text : symbol + " Stock Value"
    }
      	var subtitle = {
		useHTML: true,
		text: "<a href=https://www.alphavantage.co/ target=_blank>Source: Alpha Vantage</a>"
	}
    var series = [{
       	type: "areaspline",
        name : 'AAPL',
        data : data,
        tooltip: {
        	valueDecimals: 2
        }
    }]

    var yAxis = {
		title: {
			text: "Stock Value"
		}
	}
	var responsive = {
        rules: [{
            condition: {
                maxWidth: 500
            },
            // Make the labels less space demanding on mobile
            chartOptions: {
                rangeSelector: {
			       	buttons: [{
						type: 'month',
						count: 1,
						text: '1m'
					}, {
						type: 'month',
						count: 3,
						text: '3m'
					}, {
						type: 'month',
						count: 6,
						text: '6m'
					}, {
						type: 'year',
						count: 1,
						text: '1y'
					}, {
						type: 'all',
						text: 'All'
					}],
			        selected : 0,
			        inputEnabled: false
			    }
            }
        }]
    }
    var json = {};
	json.title = title;
	json.subtitle = subtitle;
	json.yAxis = yAxis;
	json.rangeSelector = rangeSelector;
	json.series = series;
	json.responsive = responsive;
    $('#history').highcharts('StockChart', json);
}

function chartIndicators(jsonObj, fun) {
	if (Object.keys(jsonObj).length <= 1) {
		document.getElementById(fun).innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get "+fun+" data.</div>";
		return;
	}
	symbol = jsonObj["Meta Data"]["1: Symbol"];
	titleText = jsonObj["Meta Data"]["2: Indicator"];
	rowData = jsonObj["Technical Analysis: "+fun];
	xdate = new Array();
	ydata1 = new Array();
	ydata2 = new Array();
	ydata3 = new Array();
	key = Object.keys(rowData);
	legendtext = Object.keys(rowData[key[0]]);
	if (fun == "STOCH") {
		titleText = "Stochastic Oscillator (STOCH)";
		for (i = 0; i <= 130; i++) {
			xdate[i] = key[i].substr(5,2) + "/" + key[i].substr(8,2);
			ydata1[i] = parseFloat(rowData[key[i]]["SlowK"]);
			ydata2[i] = parseFloat(rowData[key[i]]["SlowD"]);
		}
		xdate.reverse();
		ydata1.reverse();
		ydata2.reverse();
	}
	else if (fun == "BBANDS" || fun == "MACD") {
		for (i = 0; i <= 130; i++) {
			xdate[i] = key[i].substr(5,2) + "/" + key[i].substr(8,2);
			ydata1[i] = parseFloat(rowData[key[i]][legendtext[0]]);
			ydata2[i] = parseFloat(rowData[key[i]][legendtext[1]]);
			ydata3[i] = parseFloat(rowData[key[i]][legendtext[2]]);
		}
		xdate.reverse();
		ydata1.reverse();
		ydata2.reverse();
		ydata3.reverse();
	}
	else {
		for (i = 0; i <= 130; i++) {
			xdate[i] = key[i].substr(5,2) + "/" + key[i].substr(8,2);
			ydata1[i] = parseFloat(rowData[key[i]][fun]);
		}
		xdate.reverse();
		ydata1.reverse();
	}
	var chart = {
		zoomType: 'x'
	}
	var title = {
		text: titleText
	}
	var subtitle = {
		useHTML: true,
		text: "<a href=https://www.alphavantage.co/ target=_blank>Source: Alpha Vantage</a>"
	}
		
	var xAxis = {
		tickLength: 4,
		tickInterval: 5, 
		categories: xdate, 
		labels: {
			rotation: 315, 
			style: {
				"font-size": 11
			}
		}
	}
	var yAxis = {
		title: {
		text: fun
		}
	}
	var plotOptions = {
		line: {
			lineWidth: 1.5
		}
	}
	var series;
	if (fun == "STOCH") {
		series = [
			{
				name: symbol+" SlowK", 
				type: "line", 
				data: ydata1, 
				marker: {
					radius: 2, 
					symbol: "square"
				}
			},
			{
				name: symbol+" SlowD", 
				type: "line", 
				data: ydata2, 
				marker: {
					radius: 2, 
					symbol: "square"
				}
			}
		]
	}
	else if (fun == "BBANDS" || fun == "MACD") {
		series = [
			{
				name: symbol+" "+legendtext[0], 
				type: "line", 
				data: ydata1, 
				marker: {
					radius: 2, 
					symbol: "square"
				}
			},
			{
				name: symbol+" "+legendtext[1], 
				type: "line", 
				data: ydata2, 
				marker: {
					radius: 2, 
					symbol: "square"
				}
				},
			{
				name: symbol+" "+legendtext[2], 
				type: "line", 
				data: ydata3, 
				marker: {
					radius: 2, 
					symbol: "square"
				}
			}
		]
	}
	else {
		series = [
			{
				name: symbol, 
				type: "line", 
				data: ydata1, 
				marker: {
					radius: 2, 
					symbol: "square"
				}
			}
		]
	}
	var json = {};
	json.chart = chart;
	json.title = title;
	json.subtitle = subtitle;
	json.xAxis = xAxis;
	json.yAxis = yAxis;
	json.plotOptions = plotOptions;
	json.series = series;
	$('#'+fun).highcharts(json);
	jsonfiles[fun] = json;
}

function printNews(jsonObj) {
	var news = "";
	var count = 0;
	var article = jsonObj["rss"]["channel"][0]["item"];
	for (var i = 0; i < article.length; i++) {
		var link = article[i]["link"][0];
		if (link.substring(25,26) == "a" && count < 5) {
			var title = article[i]["title"][0];
			var author = article[i]["sa:author_name"][0];
			var time = article[i]["pubDate"][0];
			news += "<div class='well well-lg newsformat'><a class='news' href="+link+" target='_blank'><p>"+title+"</p></a><br><p>Author: "+author+"</p><p>Date: "+time.substring(0,time.length-5)+" EDT</p></div><br>";
			count++;
		}
		if (count >= 5) break;
	}
	document.getElementById("news").innerHTML = news;
}	