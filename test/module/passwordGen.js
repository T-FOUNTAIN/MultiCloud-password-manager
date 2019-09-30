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

var excludeSpecial = function(s) {  
    // 去掉转义字符  
    s = s.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');  
    // 去掉特殊字符  
    s = s.replace(/[\@\#\$\%\^\&\*\{\}\:\"\L\<\>\?]/);  
    return s;  
 }; 

function randomRange(myMin, myMax) {
    return Math.floor(Math.random()*(myMax - myMin + 1)) + myMin; 
}

const random = require('../function/RandomNum');
const pbkdf2 = require("../function/improved_pbkdf2").pbkdf2;
const sm3 = require('../function/sm3_index');
const Base64 = require('../function/base64').Base64;

//输入为base 64格式，kLen是需要的字节长度 一般在6-18字节？
//模式1为有特殊字符 0为无
function password_gen(Site_UserName,MP,T,mode){
    const kLen = randomRange(6,18);
    const hashUsername = sm3(Site_UserName, 0,1);
    const t = sm3(T,0,1);
    const salt1 = binary2hex(Bytes2Str(random(32)));
    const Salt1 = Str2Bytes(binary2hex(binaryCal(salt1,hashUsername,xor)));

    const P = pbkdf2(MP,Salt1,20);//P是字符串

    const salt2 = binary2hex(Bytes2Str(random(32)));
    const Salt2 = Str2Bytes(binary2hex(binaryCal(salt2,t,xor)));

    const Site_Password = pbkdf2(P,Salt2,20);
    const base64code = Base64.encode(Byte2Ascii(Str2Bytes(Site_Password)));

    if(mode == 1){
        base = base64code.substr(base64code.length-kLen,kLen-1);
        r = randomRange(0,kLen-1);
        return base.slice(0, r) + '_' + base.slice(r);
    }
    if(mode == 0){
        basecode = excludeSpecial(base64code);
        return basecode.substr(0,kLen);
    }
}//输出同样为base64

module.exports = {
    password_gen(Site_UserName,MP,T,mode){
        return password_gen(Site_UserName,MP,T,mode);
    }
}

//console.log(password_gen("adadad%%@#!","AA@#A3ad","12324df",1));