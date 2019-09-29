var msg =[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
var corrupte =[ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23, 69,129,250,115];

var res =encode(msg,msg.length,2);
console.log(res);

var r = decode(corrupte,corrupte.length,2);
console.log(r);

