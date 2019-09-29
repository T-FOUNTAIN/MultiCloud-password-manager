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
function pad(array){
    const len = array.length;
    const padnum = 16-len%16;
    if(len%16!=0){
        for(var i =0;i<(16-len%16);i++)array.unshift(padnum);
    }
    else{
        for(var i =0;i<16;i++)array.unshift(padnum);
    }
}


//sm4输入输出均为字节数组形式
//sm3支持字符形式输入或者二进制形式输入
const random = require('../function/RandomNum');
const pbkdf2 = require("../function/improved_pbkdf2").pbkdf2;
const sm3 = require('../function/sm3_index');
const sm4_encrypt = require('../function/sm4_index').encrypt;
//const sm4_decrypt = require('../function/sm4_index').decrypt;
const divideScrt = require('../function/SecretShareRS').divide;

//输入均为base64可打印编码
function divide(siteUsername,sitePassword,Msg,MP,n,k,URL){
    const K= random(16);//字节数组形式 128b
    console.log(K.join(""));
    const M = siteUsername+'!'+sitePassword+'!'+Msg;//加上！便于在明文中区分

    console.log(M);

    const m = Str2Bytes(binary2hex(str2binary(M)));//字节数组形式
    console.log(m.join(''));

    pad(m);

    

    const C = sm4_encrypt(m,K);

    const c =  hex2binary(Bytes2Str(C));//二进制形式
    const Key =  hex2binary(Bytes2Str(K));//二进制形式
    //console.log(Key);

    const hashc = sm3(c,1,1);
    const difference = binaryCal(Key,hashc,xor);//256b
    //console.log(difference);

    const secret = difference + c;//二进制
    const Secret = Str2Bytes(binary2hex(secret));//字节数组
    //console.log(Secret.join(""));

    const Data = divideScrt(Secret,n,k);//嵌套字节数组

    var salt = [];
    var Cipher  = [];
    var key =[];
    var output = [];

    for(var i =0;i<n;i++){
        salt.push(random(32));//字节数组形式 256b
        key.push(Str2Bytes(pbkdf2(MP,salt[i],16)));//产生16字节秘钥 十六进制字符串形式
        pad(Data[i]);//sm4是ecb模式，需要填充
        Cipher.push(sm4_encrypt(Data[i],key[i]));//字节数组形式
        output.push(URL+'!'+Bytes2Str(salt[i])+'!'+Bytes2Str(Cipher[i])+'!'+sm3(Bytes2Str(Cipher[i]),0,0));

        /*
        最终output形式：
        URL(base64编码形式)+salt（十六进制字符串形式）+Cipher(十六进制字符串形式)+Cipher hash（十六进制字符串）
        因为base64字符和十六进制字符串是没有‘！’，则用！作为分界
        */ 
    }
    return output;

}

console.log(divide('tfountain','66666','buaanb','11adca12',4,3,'http://asdadadas'));
//console.log(Base64.encode('tofunatain'));
//console.log (Str2Bytes(binary2hex(str2binary("tofunatain"))));
//1000101110100000001011011001000110000011011011000111010000111001111011100101011101101111100111000011110100000001010001111101101100000000110100111000110001101110111101110011101001111100111011011111010101101001010110011011001100111110111110000011001110110111
//1000101110100000001011011001000110000011011011000111010000111001111011100101011101101111100111000011110100000001010001111101101100000000110100111000110001101110111101110011101001111100111011011111010101101001010110011011001100111110111110000011001110110111