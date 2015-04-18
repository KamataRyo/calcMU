var should = require('should');
var geoA = require('../js/geoAnalysis.js');
var q = "";


describe('geoAnalysisのテスト',function(){

	q = 'wheather single url with a "ll" query can be parsed.';
	it(q,function(){
		var arg = "https://www.ingress.com/intel?ll=33.814384,135.857839&z=21";
		var ans = {"lat" : 33.814384, "lon" :135.857839};
		geoA.getLocation(arg).lat.should.equal(ans.lat);
		geoA.getLocation(arg).lon.should.equal(ans.lon);
	});


	q = 'Single url with a "pll" query can be parsed, prior to "ll" queries.';
	it(q,function(){
		var arg = "https://www.ingress.com/intel?ll=33.814384,135.857839&z=21&pll=33.814377,135.857808";
		var ans = {"lat" : 33.814377, "lon" :135.857808};
		geoA.getLocation(arg).lat.should.equal(ans.lat);
		geoA.getLocation(arg).lon.should.equal(ans.lon);
	});


	q = 'Wheather several URLs are parsable.';
	it(q,function(){
		var arg = [
			//ローソン日置川
			"https://www.ingress.com/intel?ll=33.569192,135.435726&z=16&pll=33.568856,135.435645",
			//宮島祠,1/2メッシュコード=5136-0179-3
			"https://www.ingress.com/intel?ll=34.066232,136.243711&z=18",
			//久鬼郵便局,1/2メッシュコード=5136-0210-3
			"https://www.ingress.com/intel?ll=34.014473,136.254376&z=19"
		];
		var ans = [
				{ "lat" : 33.568856, "lon" : 135.435645},
				{ "lat" :  34.066232, "lon" : 136.243711},
				{ "lat" :  34.014473, "lon" : 136.254376}
			];
		for (var i = arg.length - 1; i >= 0; i--) {
			geoA.getLocations(arg)[i].lat.should.equal(ans[i].lat);
			geoA.getLocations(arg)[i].lon.should.equal(ans[i].lon);
		};
	});


	q = 'A correct 1/2 mesh-code(this is Japanese local geographical standard) can be calculate from a pair of Lat. & lon.' ;
	it(q,function(){
		var arg = {"lat" : 34.066232, "lon" : 136.243711};
		var ans = "513601793"//宮島祠,5136-0179-3
		geoA.getMesh(arg).code.should.equal(ans);
	});

	q = 'canvas creation test';
	it(q,function(){
		var arg = [
			{ "lat" : -2, "lon" : 4},
			{ "lat" :  3, "lon" : 5},
			{ "lat" :  5, "lon" : -1}
		];
		var ans = {};
		ans.top    =  5;
		ans.right  =  5;
		ans.bottom = -2;
		ans.left   = -1;
		var testCanvas = geoA.createCanvas(arg);
		testCanvas.top.should.equal(ans.top);
		testCanvas.right.should.equal(ans.right);
		testCanvas.bottom.should.equal(ans.bottom);
		testCanvas.left.should.equal(ans.left);
	});



	q = 'trapezoid area test';
	it(q,function(){
		var arg1 = {"lat" : 5, "lon" : 2};
		var arg2 = {"lat" : 8, "lon" : 4};
		var ans =(4-2) * (8 + 5) / 2 ;//w = 2, h = 5,8の台形の面積
		geoA.calcShadowArea(arg1,arg2).should.equal(ans);
	});


	q = 'polygon area calculation test(even concaved polygon should be calculable.)';
	it(q,function(){
		//コの字の面積を求める
		var arg = [
			{"lat" : 0, "lon" : 0},
			{"lat" : 0, "lon" : 0},
			{"lat" : 0, "lon" : 0},
			{"lat" : 0, "lon" : 0},
			{"lat" : 0, "lon" : 0},
			{"lat" : 0, "lon" : 0},
			{"lat" : 0, "lon" : 0},
			{"lat" : 0, "lon" : 0}
		];
		var ans = 100;
		geoA.calcArea(arg).should.equal(ans);
	});


	q = "Function matrix can be solve.";
	it(q, function(){
		var arg = [[5,2,2],[1,1,1]];
		var ans = {"lat" : -1, "lon" : 3};
		geoA.solveMatrix(arg).lat.should.equal(ans.lat);
		geoA.solveMatrix(arg).lon.should.equal(ans.lon);
	});



	q = "function matrix creation test";
	it(q,function(){
		var arg = [
			{"lat" : 1, "lon" : 1},
			{"lat" : 2, "lon" : 4}
		];//segment
		var ans = [2,3,4];//functionMatrix
		geoA.createFunctionMatrixFromASegment(arg).should.equal(ans);
		//[1,1,1].should.deepEqual([1,1,1]);
	});



	q="test of 'segmentsCross'";
	it(q, function(){});



	q="test of 'getCrossPoint'";
	it(q, function(){});



	q = "test of 'iteratePolygonSegments'";
	it(q, function(){});


	q = "test of 'pointInPolygon'";
	it(q, function(){});


	q = "test of 'polygonsIntersect'";
	it(q, function(){});


	q = "test of 'getIntersect'";
	it(q, function(){});

	q = "test of 'ovarwrapRate'";
	it(q, function(){});	


	q = "test of 'getOverwrapRateMatrix'";
	it(q, function(){});	


	q = "test of 'getPopulation'";
	it(q, function(){});



	q = "test of 'calcPopulation'";
	it(q, function(){});	


	q = "test of 'calcMU'";
	it(q, function(){});	



	q="test of 'getIntersect'";
	it(q,function(){
		var triangle = [
			{"lat" : 3, "lon" :3},
			{"lat" : 10, "lon" :3},
			{"lat" : 3, "lon" :10}
		];
		var mesh = {};
		mesh.polygon =[ 
			{"lat" : 0, "lon" :0},
			{"lat" : 5, "lon" :0},
			{"lat" : 5, "lon" :5},
			{"lat" : 0, "lon" :5}
		];
		ans = 4;
		geoA.getTriangleDirection(triangle, mesh).should.equal(ans);
	});



});


