// running on node.js
/**
 * 左补0到指定长度
 */
function leftPad(input, num) {
    if (input.length >= num) return input;

    return (new Array(num - input.length + 1)).join('0') + input
}

/**
 * 二进制转化为十六进制
 */
function binary2hex(binary) {
    const binaryLength = 8;
    let hex = '';
    for (let i = 0; i < binary.length / binaryLength; i++) {
        hex += leftPad(parseInt(binary.substr(i * binaryLength, binaryLength), 2).toString(16), 2);
    }
    return hex;
}

/**
 * 十六进制转化为二进制
 */
function hex2binary(hex) {
    const hexLength = 2;
    let binary = '';
    for (let i = 0; i < hex.length / hexLength; i++) {
        binary += leftPad(parseInt(hex.substr(i * hexLength, hexLength), 16).toString(2), 8);
    }
    return binary;
}

/**
 * 普通字符串转化为二进制
 */
function str2binary(str) {
    let binary = '';
    for (const ch of str) {
        binary += leftPad(ch.codePointAt(0).toString(2), 8);
    }
    return binary;
}
//十六进制字符串转字节数组
function Str2Bytes(str) {
    var pos = 0;
    var len = str.length
    if (len % 2 != 0) {
        return null;
    }

    len /= 2;
    var hexA = new Array();

    for (var i = 0; i < len; i++) {
        var s = str.substr(pos, 2);
        var v = parseInt(s, 16);
        hexA.push(v);
        pos += 2;
    }
    return hexA;
}
 
//字节数组转十六进制字符串
 
function Bytes2Str(arr) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        var tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = "0" + tmp;
        }
        str += tmp;
    }
    return str;
}
/*字节转字符，只考虑ASCII编码，因为base64是可见的*/
function Byte2Ascii(Byte){
    let str = '';
    for(var i = 0;i<Byte.length;i++){
        str+=String.fromCharCode(Byte[i]);
    }
    return str;
}






var rs = require('./reedsolomon');

function RS(messageLength, errorCorrectionLength) {
	var dataLength = messageLength - errorCorrectionLength;
	var encoder = new rs.ReedSolomonEncoder(rs.GenericGF.AZTEC_DATA_8());
	var decoder = new rs.ReedSolomonDecoder(rs.GenericGF.AZTEC_DATA_8());
	return {
		dataLength: dataLength,
		messageLength: messageLength,
		errorCorrectionLength: errorCorrectionLength,

		encode : function (message) {
			encoder.encode(message, errorCorrectionLength);
		},

		decode: function (message) {
			decoder.decode(message, errorCorrectionLength);
		}
	};
}

//容许差错数是差错校验位的1/2

//msg字节数组形式输入
//以字节数组形式输出
function encode(msg,msgLength,allowErrLength){
    var ec = RS(msgLength+allowErrLength*2,allowErrLength*2);
    var message = new Int32Array(ec.messageLength);
    for(var i=0;i<ec.dataLength;i++)message[i]=msg[i];

    var res = [];
 
   /* 
    console.log('raw data');
    console.log(Array.prototype.join.call(message));
    */
    ec.encode(message);
    for(var i =0;i<ec.messageLength;i++)res[i]=message[i];

    return res;
}
//以字节数组形式输入，以字节数组形式输出
function decode(code,msgLength,allowErrLength){
    var ec = RS(msgLength+allowErrLength*2,allowErrLength*2);

    var Code = new Int32Array(ec.messageLength);
    for(var i=0;i<ec.messageLength;i++)Code[i]=code[i];
    ec.decode(Code);

    var res=[];
    for(var i=0;i<msgLength;i++)res[i]=Code[i];
    return res;

    
}

//服务器总数n  门限值为k 秘密msg以字节形式数组存储
function divide(msg,n,k){
    const tmp = 2*k-n;
    const len = msg.length;
    const pad = (tmp-(len%tmp))%tmp;
    if(tmp<=0){
        console.assert("you need a larger k!");
        return;
    }
    else{
        for(var i = 0;i<pad;i++)msg.unshift(0);//padding
        var a = msg.length/tmp;//每个服务器分到的字节数量为a
        var data = encode(msg,msg.length,a*(n-k));//返回一个数组

        var Data =[];
        for(var i=0;i<n;i++){
            Data[i] = data.slice(i*a,(i+1)*a);
        }
        return Data;
    }
}

function reCombine(Data,n,k){
    var data=[];//将数据拆分
    for(var i =0;i<n;i++)data.push(Data[i]);
    const a = data[0].length;

    var code=[];
    for(var i = 0;i<n;i++)code=code.concat(data[i]);

    var padMsg = decode(code,code.length,a*(n-k));
    padMsg = padMsg.slice(0,padMsg.length-2*a*(n-k));    

    while(padMsg[0]==0){
        padMsg.shift();
    }
    return padMsg;
}
/*

var test = "tfountainlocve afajkf asfa ad";
var Hex = Str2Bytes(binary2hex(str2binary(test)));
console.log(Hex.join(''));
var array= divide(Hex,4,3);
console.log(array);
var index=[];
for(var i=0;i<4;i++){
    index.push (Byte2Ascii(array[i]));
    console.log(index[i]);
}
index[1][2]='a';
console.log(Str2Bytes(binary2hex(str2binary(index[1]))));

var code = [ [ 1, 116, 102, 111, 117, 110, 116, 97, 105, 110, 108, 111, 99, 118 ],
[ 133, 122, 97, 102, 97, 106, 107, 102, 32, 97, 115, 102, 97, 32, 97 ],
[ 100, 46, 254, 6, 97, 110, 109, 215, 128, 38, 18, 73, 219, 7 ],
[ 41, 20, 10, 95, 107, 99, 174, 159, 207, 113, 127, 66, 34, 26, 7 ] ];

var decode = reCombine(code,4,3);
console.log(decode.join(''));

if(Hex==decode.join)console.log('true');
const string = Byte2Ascii(decode);
if(string == test)console.log('true');
console.log(Byte2Ascii(decode));
*/

module.exports={
    divide(msg,n,k){
        return divide(msg,n,k);
    },
    reCombine(code,n,k){
        return reCombine(code,n,k);
    }
};

//var res = String.fromCharCode.apply( null , arr );(null,hex2binary(Bytes2Str(decode)));
//console.log(res);



/*
var ec = RS(32, 8);
var message = new Int32Array(ec.messageLength);
for (var i = 0; i < ec.dataLength; i++) message[i] = i;

console.log('raw data');
console.log(Array.prototype.join.call(message));
//=> 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,0,0,0,0,0,0,0

ec.encode(message);
//console.log(message);

console.log('rs coded');
console.log(Array.prototype.join.call(message));
//=> 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,180,183,0,112,111,203,47,126

console.log('corrupted');
for (var i = 0; i < 5; i++) message[ Math.floor(Math.random() * message.length) ] = 0xff;
console.log(Array.prototype.join.call(message));
//=> 0,1,2,3,4,255,6,7,8,9,10,11,12,13,14,15,255,17,18,19,20,21,22,23,255,183,255,112,111,203,47,126

ec.decode(message);

console.log('rs decoded');
console.log(Array.prototype.join.call(message));
//=> 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,180,183,0,112,111,203,47,126
*/