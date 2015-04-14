//URLをparseしてllの値を取得
var getLocation = function(url){
	var qs = require('querystring');
	var hasQuery = url.indexOf('?') != -1;
	if (hasQuery) {
		var queryStrings = url.split('?')[1];
		var query = qs.parse(queryStrings);
		var result = {};
		var key = '';
		
		if ('pll' in query) {key = 'pll';}else{key = 'll';};

		result.lat = parseFloat(query[key].split(',')[0]);
		result.lon = parseFloat(query[key].split(',')[1]);
		return result;
	};
	return result;
};


//複数のURLをparseしてllの値を取得
var getLocations = function (urls){
	var result = [];
	for (var i = 0 ; i < urls.length ; i++) {
			result.push(getLocation(urls[i]));
		};
	return result;
};


//緯度経度を処理してメッシュオブジェクトを生成
var getMesh = function(point){
	var lat0 = point.lat;
	var lon0 = point.lon;
	//1次メッシュ。
	//lat:40分区切り
	//lon:1度区切り
	//lat1,lon1は1次メッシュの南西端座標
	var lat1 = Math.floor(lat0 * 1.5) / (1.5);
	var lon1 = Math.floor(lon0 * 1) * 1;
	var code1_lat = lat1 * 1.5;
	var code1_lon = lon1 - 100;
	var code1 = String(code1_lat) + String(code1_lon);
	
	//2次メッシュ。
	//1次メッシュを8x8等分。
	//lat:5分区切り
	//lon:7分30秒区切り
	//lat2,lon2は2次メッシュの南西端座標
	var code2_lat = Math.floor((lat0 - lat1) / (  5 / 60));
	var code2_lon = Math.floor((lon0 - lon1) / (7.5 / 60));
	var code2 = String(code2_lat) + String(code2_lon);
	var lat2 = lat1 + code2_lat / (60 / 5  );
	var lon2 = lon1 + code2_lon / (60 / 7.5);
	
	//3次メッシュ。
	//2次メッシュを10x10等分
	//lat:30秒区切り
	//lon:45秒区切り
	//lat3,lon3は3次メッシュの南西端座標
	var code3_lat = Math.floor((lat0 - lat2) / (30 / 3600));
	var code3_lon = Math.floor((lon0 - lon2) / (45 / 3600));
	var code3 = String(code3_lat) + String(code3_lon);
	var lat3 = lat2 + code3_lat / (3600 / 30);
	var lon3 = lon2 + code3_lon / (3600 / 45);

	//1/2メッシュ。
	//3次メッシュを2x2等分
	//lat:15秒区切り
	//lon:22.5秒区切り
	//lat4,lon4は1/2メッシュの南西端の座標。
	var code4_lat = Math.floor((lat0 - lat3) / (15   / 3600));
	var code4_lon = Math.floor((lon0 - lon3) / (22.5 / 3600));
	var code4 = String(2 * code4_lat + code4_lon + 1);
	var lat4 = lat3 + code4_lat / (3600 / 15);
	var lon4 = lon3 + code4_lon / (3600 / 22.5);	

	var result = {};
	result.code = code1 + code2 + code3 + code4;
	result.top = lat4 + (15 / 3600);
	result.right = lon4 + (22.5 / 3600);
	result.bottom = lat4;
	result.left = lon4 ;
	
	var p1 = {"lat" : result.bottom, "lon" : result.left};
	var p2 = {"lat" : result.top,    "lon" : result.left};
	var p3 = {"lat" : result.top,    "lon" : result.right};
	var p4 = {"lat" : result.bottom, "lon" : result.right};
	result.polygon = [p1, p2, p3, p4];

	return result;
};




//矩形複数の点から、すべての点を包含する長方形（キャンバスと呼ぶ）を作成。
var createCanvas = function(points){
	var p;
	var max = {}, min = {};
	max.lat = points[0].lat;
	max.lon = points[0].lon;
	min.lat = points[0].lat;
	min.lon = points[0].lon;

	for (var i = points.length - 1; i >= 1; i--) {
		p = points[i];
		max.lat = Math.max(p.lat, max.lat);
		max.lon = Math.max(p.lon, max.lon);
		min.lat = Math.min(p.lat, min.lat);
		min.lon = Math.min(p.lon, min.lon);
	};

	var result = {};
	result.top = max.lat;
	result.right = max.lon;
	result.bottom = min.lat;
	result.left = min.lon;
	var p1 = {"lat" : min.lat,
			  "lon" : min.lon};
	var p2 = {"lat" : max.lat,
			  "lon" : min.lon};
	var p3 = {"lat" : max.lat,
			  "lon" : max.lon};
	var p4 = {"lat" : min.lat,
			  "lon" : max.lon};
	result.polygon = [p1, p2, p3, p4];
	return result;
};




//キャンバスを満たす、1/2メッシュオブェクト行列を作成
var createMeshCodeMatrixFromCanvas = function(canvas){
	var result_x = [];
	var result_y = [];
	var p;
	var initial = getMesh({"lat" : canvas.top, "lon" : canvas.left});
	for (var y = (initial.top + initial.bottom) / 2 ; y  > canvas.bottom ; y -= (15 / 3600)) {
		for (var x = (initial.left + initial.right) / 2 ; x < canvas.right ; x += (22.5 / 3600)) {
			p = {"lat" : y, "lon" : x};
			result_x.push(getMesh(p));
		};
		result_y.push(result_x);
		result_x = [];
	};
	return result_y;
};



//p1, p2からなる線分が、経度軸との間で挟む符号付面積を求める
var calcShadowArea = function(p1, p2){
	var result = (p2.lat + p1.lat) * (p2.lon - p1.lon) / 2;
	return result;
};



//ポリゴンにおけるすべての線分の、符号付面積の総和。ポリゴンの面積に相当。
var calcArea = function(points){
	var result = 0;
	for (var i = 0; i <= points.length - 2; i++) {
		result += calcShadowArea(points[i], points[i + 1]);
	};
	result += calcShadowArea(points[i], points[0]);
	return result;
};

//連立方程式を解く
//matrix =[[a,b,-s],[c,d,-t]]
var solveMatrix = function(matrix){
	var a = matrix[0][0];
	var b = matrix[0][1];
	var s = matrix[0][2] * -1 ;
	var c = matrix[1][0];
	var d = matrix[1][1];
	var t = matrix[1][2] * -1 ;
	var det = a * d - b * c;
	if (det === 0) {return false};
	var x = (1 / det) * (s * d - t * b);
	var y = (1 / det) * (-1 * s * c + a * t);
	var result = {"lat" : y, "lon" : x};
	return result;
};

//2点から直線の方程式の行列[a,b,-s]を作成
var createFunctionMatrixFromASegment = function(seg){
	var p1 = seg[0];
	var p2 = seg[1];
	var x1 = p1.lon;
	var y1 = p1.lat;
	var x2 = p2.lon;
	var y2 = p2.lat;
	var a = y1 - y2;//xの係数
	var b = x2 - x1;//yの係数
	var s = x2 * y1 - x1 * y2;//定数項
	var result = [a, b, -1 * s];
	return result;
};

//2線分の交点の有無を判定
var segmentsCross = function (seg1, seg2){
	//1x3行列の積を求める
	var mmult = function (m1,x,y){
		return m1[0] * x + m1[1] * y + m1[2];
	};
	var matrix1 = createFunctionMatrixFromASegment(seg1);
	var matrix2 = createFunctionMatrixFromASegment(seg2);
	var result1 = mmult(matrix1,seg2[0].lon,seg2[0].lat);
	var result2 = mmult(matrix1,seg2[1].lon,seg2[1].lat);
	var result3 = mmult(matrix2,seg1[0].lon,seg1[0].lat);
	var result4 = mmult(matrix2,seg1[1].lon,seg1[1].lat);
	var result = (result1 * result2 < 0) && (result3 * result4 < 0);
	return result;
};


//ポリゴンの線分をイテレート
var iteratePolygonSegments = function(poly){
	var result = [];
	for (var i = 0; i <= poly.length -2 ; i++) {
		result.push([poly[i],poly[i + 1]]);
	};
	result.push([poly[i],poly[0]]);

	return result;
};


//ポリゴン（=ポイントの配列）の中に、あるポイントが含まれるかどうかを判定する
var pointInPolygon = function(point,polygon){
	var result = 0;
	var buf = false;

	var seg1;
	var seg2 = [{"lat" : 0, "lon" : 0}, point];
	var segs = iteratePolygonSegments(polygon);

	for (var i = 0; i <= segs.length - 1; i++) {
		seg1 = segs[i];
		buf = segmentsCross(seg1, seg2);
		if (buf) {result++;};
	};
	return (result % 2 === 1);
};



//ポリゴンの重複判定
var polygonsIntersect = function(poly1, poly2){
	var crossed = false;
	var segs1 = iteratePolygonSegments(poly1);
	var segs2 = iteratePolygonSegments(poly2);
	for (var i = 0; i <= segs1.length - 1; i++) {
		for (var j = 0; j<= segs2.length -1; j++) {
			crossed = segmentsCross(segs1[i],segs2[j]);
			if (crossed) {return true};
		};
	};
	return false;
};


var getIntersect = function(){};






//あるメッシュにおけるポリゴンの面積重複率を求める
var ovarwrapRate = function(mesh, poly){
	var point = {"lat" : (mesh.bottom + mesh.top)/2, "lon" : (mesh.left + mesh.right)/2};
	var intersect = polygonsIntersect(poly,mesh.polygon);
	var inside = pointInPolygon(point,poly);
	if (intersect) {return 0.5;};
	if (!intersect && !inside)  {return 0;};
	if (!intersect &&  inside)  {return 1;};
};




var getOverwrapRateMatrix = function(matrix,poly){
	var result_xx=[];
	var result_yy=[];
	var buf;
	for (var y = 0; y <= matrix.length - 1; y++) {
		for (var x = 0 ; x <= matrix[y].length - 1; x++) {
			var buf = ovarwrapRate(matrix[y][x],poly);
			result_xx.push(buf);
		};
		result_yy.push(result_xx);
		result_xx = [];
	};
return result_yy;
};



var getPopulation = function(code){
	var json = require('../jsons/population.json');
	var result = json[code];
	if (result) {
		return result;
	}else{
		return 0;
	};
};

var calcPopulation = function(meshMatrix,rateMatrix){
	var result = 0;
	var code = "";
	var rate;
	for (var y = 0; y <= meshMatrix.length - 1; y++) {
		for (var x = 0 ; x <= meshMatrix[y].length - 1; x++) {
			code = meshMatrix[y][x].code;
			rate = rateMatrix[y][x];
			result += getPopulation(code) * rate;
		};
	};
	return result;
};

var calcMU = function(locations){
	//var locations     = getLocations(urls);
	var canvas        = createCanvas(locations);
	var meshMatrix    = createMeshCodeMatrixFromCanvas(canvas);
	var overRapMatrix = getOverwrapRateMatrix(meshMatrix,locations);

	return calcPopulation(meshMatrix,overRapMatrix);
};




exports.getLocation = getLocation;
exports.getLocations = getLocations;
exports.getMesh = getMesh;
exports.createCanvas = createCanvas;
exports.createMeshCodeMatrixFromCanvas = createMeshCodeMatrixFromCanvas;
exports.calcShadowArea = calcShadowArea;
exports.calcArea = calcArea;
exports.solveMatrix = solveMatrix;
exports.createFunctionMatrixFromASegment = createFunctionMatrixFromASegment;
exports.segmentsCross = segmentsCross;
exports.iteratePolygonSegments = iteratePolygonSegments;
exports.pointInPolygon = pointInPolygon;
exports.polygonsIntersect = polygonsIntersect;
exoorts.getIntersect = getIntersect;
exports.ovarwrapRate = ovarwrapRate;
exports.getOverwrapRateMatrix = getOverwrapRateMatrix;
exports.getPopulation = getPopulation;
exports.calcPopulation = calcPopulation;
exports.calcMU = calcMU;

