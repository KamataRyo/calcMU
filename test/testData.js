





var URLs1 = [];//2,199 MU
var URLs2 = [];//2,249 MU
var URLs3 = [];
//Kumanogawa River Stone Monument
var p1 = {};
p1.string = "https://www.ingress.com/intel?ll=33.814384,135.857839&z=21&pll=33.814377,135.857808";
p1.ll = "33.814384,135.857839";
exports.p1 = p1;


//JR周参見駅
var p2 = "https://www.ingress.com/intel?ll=33.548038,135.500164&z=16&pll=33.54685,135.495491";
//周参見 イノブータン大王
var p3 = "https://www.ingress.com/intel?ll=33.519653,135.547499&z=16&pll=33.518374,135.54765";
//ローソン日置川
var p4 = "https://www.ingress.com/intel?ll=33.569192,135.435726&z=16&pll=33.568856,135.435645";
//宮島祠,1/2メッシュコード=5136-0179-3
var p5 = "https://www.ingress.com/intel?ll=34.066232,136.243711&z=18";
//久鬼郵便局,1/2メッシュコード=5136-0210-3
var p6 = "https://www.ingress.com/intel?ll=34.014473,136.254376&z=19";
//鳥,1/2メッシュコード=5136-0177-1
var p7 = "https://www.ingress.com/intel?ll=34.061736,136.215012&z=21";

URLs1.push(p1);
URLs1.push(p2);
URLs1.push(p3);

URLs2.push(p3);
URLs2.push(p4);
URLs2.push(p2);

URLs3.push(p5);
URLs3.push(p6);
URLs3.push(p7);

exports.testURLs1 = URLs1;
exports.testURLs2 = URLs2;
exports.testURLs3 = URLs3;