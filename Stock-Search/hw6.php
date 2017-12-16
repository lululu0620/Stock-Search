<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<title>stock</title>
	<script src="http://code.highcharts.com/highcharts.js"></script>
</head>
<style type="text/css">
	#window {
		border: solid rgb(200,200,200) 1px;
		width: 390px;
		height: 150px;
		background: rgb(240,240,240); 
		margin: auto;
	}
	#title {
		padding-top: 5px;
		text-align: center;
		font-size: 28px;
	}
	#button {
		padding-top: 3px;
		padding-left: 49%;
	}
	#text {
		padding-left: 10px;
		font-size: 15px;
		padding-bottom: 20px;
	}
	table {
		border-collapse: collapse;
		border: solid rgb(200,200,200) 2px;
		margin: auto;
		font-family: "Helvetica";
		font-size: 14px;
		width: 85%;
	}
	.header {
		border: solid rgb(200,200,200) 1px;
		background-color: rgb(240,240,240);
		font-weight: bold;
		height: 25px;
		width: 30%;
	}
	.data {
		border: solid rgb(200,200,200) 1px;
		text-align: center;
		height: 25px;
		background-color: rgb(252,252,252);
		width: 70%;
	}
	#container {
		width: 85%; 
		height: 500px; 
		margin: auto;
	}
	#click {
		width: 200px;
		color: rgb(150,150,150);
		text-align: center;
		margin: auto;
	}
	.data2 {
		border: solid rgb(200,200,200) 1px;
		text-align: left;
		height: 25px;
		background-color: rgb(252,252,252);
		width: 70%;
	}
	.indicators {
		color: blue;
	}
	a{
		color: blue;
		text-decoration: none;
	}
	a:hover,span:hover {
		color: black;
	}

</style>
<body>
	<div id="window">
		<div id="title"><b><i>Stock Search</i></b></div>
		<hr color="#C8C8C8" width=97% size=1>
		<form method="POST" action="">
			<span id="text">Enter Stock Ticker Symbol:*</span>
			<span left=50%><input id="stock" type="text" name="stock_name" size="25" value=""></span>
			<div id="button">
				<input id="search" type="button" name="search" value="Search" onclick="this.form.submit()">
				<input id="clear" type="button" name="clear" value="Clear">
			</div>
		</form>
		<div id="text"><i>*-Mandatory fields</i></div>
	</div>
	<div id="content">
		<br><div id="info"></div>
		<br><div id='container'></div>
		<br><div id='click'></div>
		<br><div id='stocknews'></div>
	</div>

<?php
	if (isset($_POST["stock_name"])&& $_POST["stock_name"] != "") {
		$arrContextOptions=array(
	    	"ssl"=>array(
	        	"verify_peer"=>false,
	        	"verify_peer_name"=>false,
	    	),
		);  
		$jsonURL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=".$_POST["stock_name"]."&outputsize=full&apikey=8NJ5D0PJN6LLJGE0";
		$json = @json_decode(file_get_contents($jsonURL,false, stream_context_create($arrContextOptions)),true);
		$table = "";
		if (sizeof($json) < 2) {
			$table = "<table>
						<tr><td class='header'>Error</td>
						<td class='data'>Error: NO recored has been found, please enter a valid symbol</td></tr></table>";
		}
		else {
			$meta = $json["Meta Data"];
			date_default_timezone_set($meta["5. Time Zone"]);
			$time = $json["Time Series (Daily)"];
			$symbol = $meta["2. Symbol"];
			$lastDay = $meta["3. Last Refreshed"];
			$lastDay = new Datetime($lastDay);
			$lastDay = $lastDay->format("Y-m-d");
			$previousDay = new Datetime($lastDay);
			$previousDay = $previousDay->modify("-1 day")->format("Y-m-d");
			while (!isset($time[$previousDay])) {
				$previousDay = new Datetime($previousDay);
				$previousDay = $previousDay->modify("-1 day")->format("Y-m-d");
			}
			$close = $time[$lastDay]["4. close"];
			$close2 = $time[$previousDay]["4. close"];
			$open = $time[$lastDay]["1. open"];
			$change = round(floatval($close) - floatval($close2),2);
			$changePer = strval(round($change*100/floatval($close2),2))."%";
			$volume = intval($time[$lastDay]["5. volume"]);
			$range = $time[$lastDay]["3. low"]."-".$time[$lastDay]["2. high"];
			$upIMG = "<img width=17px height=17px src='http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png'>";
			$downIMG = "<img width=17px height=17px src='http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png'>";
			$img = "";
			if ($change > 0) $img = $upIMG;
			if ($change < 0) $img = $downIMG;
			$table = "<table>
						<tr><td class='header'>Stock Ticker Symbol</td>
							<td class='data'>".$symbol."</td></tr>
						<tr><td class='header'>Close</td>
							<td class='data'>".$close."</td></tr>
						<tr><td class='header'>Open</td>
							<td class='data'>".$open."</td></tr>
						<tr><td class='header'>Previous Close</td>
							<td class='data'>".$close2."</td></tr>
						<tr><td class='header'>Change</td>
							<td class='data'>".$change." ".$img."</td></tr>
						<tr><td class='header'>Change Percent</td>
							<td class='data'>".$changePer." ".$img."</td></tr>
						<tr><td class='header'>Day's Range</td>
							<td class='data'>".$range."</td></tr>
						<tr><td class='header'>Volumn</td>
							<td class='data'>".number_format($volume)."</td></tr>
						<tr><td class='header'>Timestamp</td>
							<td class='data'>".$lastDay."</td></tr>
						<tr><td class='header'>Indicators</td>
							<td class='data'>
								<span class='indicators' id='price'>Price&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class='indicators' id='sma'>SMA&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class='indicators' id='ema'>EMA&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> 
								<span class='indicators' id='stoch'>STOCH&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class='indicators' id='rsi'>RSI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class='indicators' id='adx'>ADX&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class='indicators' id='cci'>CCI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class='indicators' id='bbands'>BBANDS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<span class='indicators' id='macd'>MACD</span>
							</td></tr>
						</table>";
			$DATE = new Datetime($lastDay);
			$title = array("text" => "Stock Price (".$DATE->format("m/d/Y").")");
			$subtitle = array("useHTML" => true,"text" => "<a href=https://www.alphavantage.co/ target=_blank>Source: Alpha Vantage</a>");
			$date = array();
			$price = array();
			$vol = array();
			for ($day = 130; $day >= 0; $day--) {
				$date_key = key($time);
				$date_format = new Datetime($date_key);
				$date_format = $date_format->format("m/d");
				array_push($date, $date_format);
				array_push($price, round(floatval($time[$date_key]["4. close"]),2));
				array_push($vol, intval($time[$date_key]["5. volume"]));
				next($time);
			}
			$date = array_reverse($date);
			$price = array_reverse($price);
			$vol = array_reverse($vol);
			$max = $price[array_search(max($price),$price)];
			$min = $price[array_search(min($price),$price)];
			$max_vol = $vol[array_search(max($vol),$vol)];
			$bit = 0;
			while ($max_vol >= 10) {
				$max_vol /= 10.0;
				$bit++;
			}
			$interval_vol = round($max_vol*0.7) * pow(10,$bit);
			$interval = ($max - $min) / 5.0;
			$chart = array("marginRight" => 200, "borderColor" => "rgb(200,200,200)", "borderWidth" => 2);
			$xAxis = array("tickLength" => 4, "tickInterval" => 5, "categories" => $date, "labels" => array("rotation" => 315, "style" => array("font-size" => 11)));
			$yAxis = array(array("title" => array("text" => "Stock Price"),"min" => $min-$interval, "max" => $max), array("title" => array("text" => "Volume"), "max" => 3*$interval_vol, "tickInterval" => $interval_vol, "opposite" => true));
			$series = array(array("name" => $symbol, "type" => "areaspline", "color" => "rgb(255,0,0)", "data" => $price), array("name" => $symbol." Volume", "type" => "column", "color" => "white", "yAxis" => 1, "data" => $vol));
			$legend = array("align" => "right", "verticalAlign" => "center", "layout" => "vertical", "x" => 0, "y" => 220);
			$plotOptions = array("areaspline" => array("fillColor" => "rgba(255,0,0,0.5)", "lineColor" => "rgb(255,0,0)", "lineWidth" => 1));
			$chartJSON = array("title" => $title, "subtitle" => $subtitle, "chart" => $chart, "legend" => $legend, "xAxis" => $xAxis, "yAxis" => $yAxis, "plotOptions" => $plotOptions, "series" => $series);
		}
		function printNews() {
			$table_news = "<table>";
			$xml = simplexml_load_file("https://seekingalpha.com/api/sa/combined/".$_POST["stock_name"].".xml");
			if ($xml == false) return;
			$count = 0;
			foreach($xml->channel->children() as $item) {
				if (substr($item->link,25,7) == "article" && $count < 5) {
					$str = $item->pubDate;
					$newstr = substr($str,0,strlen($str)-5); 
					$table_news .= "<tr><td class='data2'><a href=".$item->link." target=_blank>".$item->title."</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Publicated Time: ".$newstr."</td></tr>";
					$count++;
				}
			}
			$table_news .= "</table><br>";
			return $table_news;
		}	
	}
	else if (isset($_POST["stock_name"]) && $_POST["stock_name"] == "") {
		echo "<script type='text/javascript'>alert('Please enter a symbol')</script>";
	}
?>
<script type="text/javascript">
	document.getElementById("stock").value = <?PHP echo json_encode($_POST["stock_name"]) ?>;
	document.getElementById("info").innerHTML = <?php echo json_encode(@$table) ?>;
	document.getElementById("clear").addEventListener("click",clear);
	function clear() {
		document.getElementById("stock").value = "";
		document.getElementById("content").innerHTML = "";
	}
	var flag = <?php echo json_encode(sizeof($json)) ?>;
	if (flag == 2) {
		var json = <?php echo json_encode(@$chartJSON) ?>;
		var chart = new Highcharts.Chart('container',json);
		var click = "click to show stock news<br><br><img width=60px height=25px src=http://cs-server.usc.edu:45678/hw/hw6/images/Gray_Arrow_Down.png>";
		document.getElementById("click").innerHTML = click;
		document.getElementById("price").addEventListener("click",function() {
			var chart_Price = new Highcharts.Chart('container',json);
		});
		document.getElementById("sma").addEventListener("click",drawSMA);
		document.getElementById("ema").addEventListener("click",drawEMA);
		document.getElementById("stoch").addEventListener("click",drawSTOCH);
		document.getElementById("rsi").addEventListener("click",drawRSI);
		document.getElementById("adx").addEventListener("click",drawADX);
		document.getElementById("cci").addEventListener("click",drawCCI);
		document.getElementById("bbands").addEventListener("click",drawBBANDS);
		document.getElementById("macd").addEventListener("click",drawMACD);
		document.getElementById("click").onclick = print;
		function drawSMA() {loadJSON("SMA");}
		function drawEMA() {loadJSON("EMA");}
		function drawSTOCH() {loadJSON("STOCH");}
		function drawRSI() {loadJSON("RSI");}
		function drawADX() {loadJSON("ADX");}
		function drawCCI() {loadJSON("CCI");}
		function drawBBANDS() {loadJSON("BBANDS");}
		function drawMACD() {loadJSON("MACD");}
		function print() {
			var html_txt = <?php echo json_encode(@printNews()) ?>;
			var change = "click to hide stock news<br><br><img width=60px height=25px src=http://cs-server.usc.edu:45678/hw/hw6/images/Gray_Arrow_Up.png>";
			document.getElementById("click").innerHTML = change;
			document.getElementById("stocknews").innerHTML = html_txt;
			document.getElementById("click").onclick = hide;
		}
		function hide() {
			var change = "click to show stock news<br><br><img width=60px height=25px src=http://cs-server.usc.edu:45678/hw/hw6/images/Gray_Arrow_Down.png>";
			document.getElementById("click").innerHTML = change;
			document.getElementById("stocknews").innerHTML = "";
			document.getElementById("click").onclick = print;
		}
	}
	function loadJSON(fun) {
		var symbol = <?PHP echo json_encode($_POST["stock_name"]) ?>;
		var url = "https://www.alphavantage.co/query?function="+fun+"&symbol="+symbol+"&interval=daily&time_period=10&series_type=close&apikey=8NJ5D0PJN6LLJGE0";
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		}
		else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.open("GET",url,true);
		xmlhttp.send(null);
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState==4) {
  				if (xmlhttp.status==200) {
  					var jsonObj = JSON.parse(xmlhttp.responseText);
  					chartIndicators(jsonObj, fun);
	  			}
  			}
  		};
	}
	function chartIndicators(jsonObj, fun) {
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
		var title = {
			text: titleText
		}
		var subtitle = {
			useHTML: true,
			text: "<a href=https://www.alphavantage.co/ target=_blank>Source: Alpha Vantage</a>"
		}
		var chart;
		if (fun == "STOCH") {
			chart = {
				marginRight: 130, 
				borderColor: "rgb(200,200,200)", 
				borderWidth: 2
			}
		}
		else if (fun == "BBANDS" || fun == "MACD") {
			chart = {
				marginRight: 200, 
				borderColor: "rgb(200,200,200)", 
				borderWidth: 2
			}
		}
		else {
			chart = {
				marginRight: 90, 
				borderColor: "rgb(200,200,200)", 
				borderWidth: 2
			}
		}
		var legend = {
			align: "right",
			verticalAlign: "center",
			layout: "vertical",
			x: 0, 
			y: 220
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
				lineWidth: 1
			}
		}
		var series;
		if (fun == "STOCH") {
			series = [
				{
					name: symbol+" SlowK", 
					type: "line", 
					color: "red", 
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
					color: "red", 
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
					color: "red", 
					data: ydata1, 
					marker: {
						radius: 2, 
						symbol: "square"
					}
				}
			]
		}
		var json = {};
		json.title = title;
		json.subtitle = subtitle;
		json.chart = chart;
		json.legend = legend;
		json.xAxis = xAxis;
		json.yAxis = yAxis;
		json.plotOptions = plotOptions;
		json.series = series;
		var highchart = new Highcharts.Chart('container',json);
	}
</script>
<noscript>
</body>
</html>