// running on node.js
/**
 * 左补0到指定长度
 */
function leftPad(input, num) {
    if (input.length >= num) return input;

    return (new Array(num - input.length + 1)).join('0') + input
}
/**
 * 二进制运算
 */
function binaryCal(x, y, method) {
    var a = x || '';
    var b = y || '';
    const result = [];
    let prevResult;

    if(a.length>b.length)b=leftPad(b,a.length);
    else if(a.length<b.length)a=leftPad(a,b.length);


    for (let i = a.length - 1; i >= 0; i--) { // 大端
        prevResult = method(a[i], b[i], prevResult);
        result[i] = prevResult[0];
    }
    return result.join('');
}

/**
 * 二进制异或运算
 */
function xor(x, y) {
    return binaryCal(x, y, (a, b) => [(a === b ? '0' : '1')]);
}

/**
 * 二进制与运算
 */
function and(x, y) {
    return binaryCal(x, y, (a, b) => [(a === '1' && b === '1' ? '1' : '0')]);
}

/**
 * 二进制或运算
 */
function or(x, y) {
    return binaryCal(x, y, (a, b) => [(a === '1' || b === '1' ? '1' : '0')]); // a === '0' && b === '0' ? '0' : '1'
}

/**
 * 二进制与运算
 */
function add(x, y) {
    const result = binaryCal(x, y, (a, b, prevResult) => {
        const carry = prevResult ? prevResult[1] : '0' || '0';

        // a,b不等时,carry不变，结果与carry相反
        // a,b相等时，结果等于原carry，新carry等于a
        if (a !== b) return [carry === '0' ? '1' : '0', carry];

        return [carry, a];
    });
    
    return result;
}

/**
 * 二进制非运算
 */
function not(x) {
    return binaryCal(x, undefined, a => [a === '1' ? '0' : '1']);
}

function calMulti(method) {
    return (...arr) => arr.reduce((prev, curr) => method(prev, curr));
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
/*字节转字符，只考虑ASCII编码，因为base64是可见的*/
function Byte2Ascii(Byte){
    let str = '';
    for(var i = 0;i<Byte.length;i++){
        str+=String.fromCharCode(Byte[i]);
    }
    return str;
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

function unpad(array){
    const del = array[0];
    for(var i =0;i<del;i++)array.shift();
}






//sm4输入输出均为字节数组形式
//sm3支持字符形式输入或者二进制形式输入
const random = require('../function/RandomNum');
const pbkdf2 = require("../function/improved_pbkdf2").pbkdf2;
const sm3 = require('../function/sm3_index');
const sm4_encrypt = require('../function/sm4_index').encrypt;
const sm4_decrypt = require('../function/sm4_index').decrypt;
const recombSrct = require('../function/SecretShareRS').reCombine;

function Check(Data,hash,n){//十六进制字符串形式
    var cnt = 0;//cnt记录了被攻击的服务器个数
    for(var i = 0;i<n;i++){
        if((sm3(Data[i],0,0)==hash[i])==false){
            cnt++;
        }
    }
    return cnt;
}



//base64输入
function recombine(Data,n,k,Msg){
    var Salt = [];//十六进制字符串形式
    var Cipher = [];//十六进制字符串形式
    var hash = [];//十六进制字符串形式
 
    for(var i =0;i<n;i++){
        var data = Data[i].split('!');
        Cipher.push(data[1])
        hash.push(data[2]);
        //console.log(hash[i]);
    }
    check = Check(Cipher,hash,n,k);

    if(check > 0){
        console.log(check+'台服务器数据被篡改！数据可能无法恢复！');
    }

    var cipher = [];//字节数组形式
    var W = [];

    for(var i =0;i<n;i++){
        cipher.push(Str2Bytes(Cipher[i]));//字节数组形式     
    }

    const Secret = recombSrct(cipher,n,k);//字节数组形式

    const secret = hex2binary(Bytes2Str(Secret));//二进制形式

    const Difference = secret.substr(0,256);
    const C = secret.substring(256,secret.length);//C是二进制字符串

    const Key = binaryCal(Difference,sm3(C,1,1),xor);
   
    const K = Str2Bytes(binary2hex(Key));
    //console.log(K.join(""));


    const P = sm4_decrypt(Str2Bytes(binary2hex(C)),K);
    unpad(P);
    const p =Byte2Ascii(P).split('!');
    const info = {
        Site_Username :p[0],
        Site_Password :p[1]
    }
    console.log(info);
    if(p[2]==Msg)console.log("预留信息验证成功！")
    return info;
    
}
module.exports = {
    recombine(Data,n,k,Msg){
        return recombine(Data,n,k,Msg);
    }
}


recombine([ 'baidu.com.local!58e352a0af0e242e8ec0d15b271c37a05c1b35061e43c08b66f51c39c04e1f6817ad4e3b97ac3ede!07472387a27a788e188d3dfc193df342d48ca751c2c0c2234050009c097ca3d8',
'baidu.com.local!58e352a0af0e242e8ec0d15b271c37a05c1b35061e43c08b66f51c39c04e1f6817ad4e3b97ac3ede!07472387a27a788e188d3dfc193df342d48ca751c2c0c2234050009c097ca3d8',
'baidu.com.local!8d9e70ea97ddd6771f1ae543dfca46c2aca9139b8f7892261788173f6663e70c450ef267cd1a246e!f972546b3524c244ad6e4c6d57eda043fc3d2cd2958588d048e4c76aa4e543e5',
'baidu.com.local!f82aea18d536b4b89a6e912658a2d27f39877e8b02b7b13a1bea9e95725e301358c7978d962be259!f34979228bec06d195f03a08cfe6d93df5781d3fe1750feb012d2502992c7caf' ],4,3,'buaanb');
/*
[ 'baidu.com.local!d5239ae80bb709047d7c6e6244c8bca187e572935d883a81449dab3b2ffa759dab05e0f52630d7b5bc1b83c76de3ff5e50b85120105111a967d2959b5001f949!a212887a270b34f216afc90e18ece64820208355d1e6d731a8dc71958507a06a3c4f0f9ed8e868c0cb0fb3c094cc55fc!bb2694c4e558e0e0d171275260ccbe039958c63a07438a16401c2756902196ea',
'baidu.com.local!920110cb9a2bfb67893777ca5cf7e4813624235fe017774ee56798a7d69be84d66bca26dff7009c0d3eec9431625a621ee79b1b941c4f72ba9ea407cdec60cd0!bba0b358b3fae1fd42064ca1ceff64d162d917c563120fefd81611f55808bc4214d16dbd8aa237b67587cc3c0565cb10!e838954f0936b5f8d8081a329fe11e4c9528334f793ba3cce06653e6b14bbfe2',
'baidu.com.local!26177745c4b7bfa875d6b27257fd58ba1b5f11e3827e2b62802f3366cd4e611a90a3efcf1069a6a981ed9d7a0f08d22fc4f223d4444ab7bb7832450f3df9bc4f!f49ba80c7c392e64d969324944777acab34db711eb666030f539f014be84a56a3d273892597115c328bf8fa3c9419ef8!460d0d3d5629f14cb7604adcd2b88cb4e71ce7c6929aad089153781137dfe33e',
'baidu.com.local!2930d86fbc1158c9faeca8120e0e1bb5f0e577a4c5a0d33969f17cd678ad87732253788eeba527b652822c5c0d07f439ca021845a40f42de5d9f64de74523e67!cc020f0ab88adedef7696efe300b59a124bdd0d06f6aab262efa58fe3f40331ca4305d651d86cbff277a0c46aff86fab!555aad05b4b940104666cdf0692cce2c2d925ffb2bd3ccbf904a8b1e16e0c488' ]
<Buffer d5 23 9a e8 0b b7 09 04 7d 7c 6e 62 44 c8 bc a1 87 e5 72 93 5d 88 3a 81 44 9d ab 3b 2f fa 75 9d>
<Buffer ab 05 e0 f5 26 30 d7 b5 bc 1b 83 c7 6d e3 ff 5e 50 b8 51 20 10 51 11 a9 67 d2 95 9b 50 01 f9 49>
<Buffer 92 01 10 cb 9a 2b fb 67 89 37 77 ca 5c f7 e4 81 36 24 23 5f e0 17 77 4e e5 67 98 a7 d6 9b e8 4d>
<Buffer 66 bc a2 6d ff 70 09 c0 d3 ee c9 43 16 25 a6 21 ee 79 b1 b9 41 c4 f7 2b a9 ea 40 7c de c6 0c d0
>
21335154232111839412512411098682001881611352291141479313658129681571715947250117157
17152242453848215181188271311991092272559480184813216811716910321014915580124973
14611620315443251103137551192029224722812954363595224231197822910315216721415523277
10218816210925511291922112382016722371663323812117718565196247431692346412422219812208
*/
