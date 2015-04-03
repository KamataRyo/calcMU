var should = require('should');
var geoA = require('../js/geoAnalysis.js');
var q = "";

describe('geoAnalysis',function(){

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


	q = 'A correct 1/2 mesh-code(this is Japanese local geographical standard) can be calculate from a pair of Lat. & lon.' ;
	it(q,function(){
		var arg = {"lat" : 34.066232, "lon" : 136.243711};
		var ans = "513601793"//宮島祠,5136-0179-3
		geoA.getMesh(arg).code.should.equal(ans);
	});


});