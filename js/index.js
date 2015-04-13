//処理振り分けのモジュール
function analyzeURL(req , res){
	var url = require('url');
	var urlInfo = url.parse(req.url, true);
	var app = {};

	//アプリケーションに対するメソッドを取得
	app.method = req.method;
	//アプリケーションの名前を取得
	var nestedAppName = urlInfo.pathname.split("/");

	if (nestedAppName.length < 2) {
		//appName以降に/があるとき(appName/child/child/...)=ネスとした名前での要求は受け付けない
		app.resourceExists = false;
	}else{
		//アプリケーション名前で処理を判別
		appName = urlInfo.pathname.split("/")[1];
		switch(appName){
			case 'calcMU' :
				app.resourceExists = true;
				app.act = calcMU;
				break;
			default :
				app.resourceExists = false;
				break;
			}
	};
	//クエリを取得
	app.query = urlInfo.query;

	//振り分け部分
	if (app.method !== 'GET') {
		//get以外でアクセスするリソースは、いまのところない
		res.writeHead(405, {'Content-Type' : 'text/plain'});
		res.write('405 Method Not Allowed. No resource not to get.');
		return true;
	};

	if (!app.resourceExists) {
		res.writeHead(404, {'Content-Type' : 'text/plain'});
  		res.write('404 Not Found. Undefined resource is required.');
  		return true;
  	};

  	app.act(app.query,res);
  	return true;
}

//appの内部の定義
calcMU = function(q,res){
	//クエリ分解
	var polygon = [];
	var p1 = {};
	var p2 = {};
	var p3 = {};


	try{		
		console.log(q.ll1);
		p1 = {"lat" : parseFloat(q.ll1.split(',')[0]), "lon" : parseFloat(q.ll1.split(',')[1])};
		p2 = {"lat" : parseFloat(q.ll2.split(',')[0]), "lon" : parseFloat(q.ll2.split(',')[1])};
		p3 = {"lat" : parseFloat(q.ll3.split(',')[0]), "lon" : parseFloat(q.ll3.split(',')[1])};
	}catch(e){
		res.writeHead(400, {'Content-Type' : 'text/plain'});
  		res.write('400 Bad Request. unknown queries');
  		return true;
	}
	
	polygon.push(p1);
	polygon.push(p2);
	polygon.push(p3);

	var mods = require('./geoAnalysis.js');
	var result = {};
	result.polygonGPS = [p1,p2,p3];
	result.value = mods.calcMU(polygon);
	result.unit = 'MU(s)';
	console.log(result);
	res.writeHead(200, {'Content-Type' : 'text/plain'});
	res.write(result.value + result.unit);
};


//サーバ部分
var http = require('http');
var settings = require('./settings.js');
var server = http.createServer();

server.on('request', function(req, res){

	analyzeURL(req,res);
	res.end();

  	// //最後までたどり着けてしまったら、処理がおかしい。
  	// res.writeHead(500,{'Content-Type' : 'text/plain'});
  	// res.write('500 Internal Server Error. I cannot understand your request.');
});

server.listen(settings.port, settings.host);
console.log('server listening...');