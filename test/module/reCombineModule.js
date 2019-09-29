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

function Check(Data,hash,n,k){//十六进制字符串形式
    var cnt = 0;//cnt记录了被篡改的服务器个数
    for(var i = 0;i<n;i++){
        if((sm3(Data,0,0)==hash)==false){
            cnt++;
            if(cnt>n-k)return -1;
        }
    }
    return cnt;
}

//base64输入
function recombine(MP,Data,n,k){
    var Salt = [];//十六进制字符串形式
    var Cipher = [];//十六进制字符串形式
    var hash = [];//十六进制字符串形式

    for(var i =0;i<n;i++){
        var data = Data[i].split('!');
        Salt.push(data[1]);
        Cipher.push(data[2]);
        hash.push(data[3]);
    }
    check = Check(Cipher,hash,n,k);

    if(check > 0){
        if(check==-1){
            console.log('多台服务器数据被篡改！无法恢复数据');
            return;
        }else console.log(check+'台服务器数据被篡改！');
    }

    var salt = [];//字节数组形式
    var key =[];//字节数组形式
    var plain = [];//字节数组形式
    var cipher = [];//字节数组形式
    var W = [];

    for(var i =0;i<n;i++){
        cipher.push(Str2Bytes(Cipher[i]));//字节数组形式
        salt.push(Str2Bytes(Salt[i]));//字节数组形式 32B
        key.push(Str2Bytes(pbkdf2(MP,salt[i],16)));
        plain.push(sm4_decrypt(cipher[i],key[i]));//字节数组形式
        unpad(plain[i]);
        W.push(plain[i]);
        
        //console.log(W);
    }

    const Secret = recombSrct(W,n,k);//字节数组形式
    //console.log(Secret.join(''));

    const secret = hex2binary(Bytes2Str(Secret));//二进制形式
    const Difference = secret.substr(0,256);
    //console.log(Difference);

    const C = secret.substring(256,secret.length);//C是二进制字符串

    const Key = binaryCal(Difference,sm3(C,1,1),xor);
   
    const K = Str2Bytes(binary2hex(Key));
    //console.log(K.join(""));


    const P = sm4_decrypt(Str2Bytes(binary2hex(C)),K);
    unpad(P);
    console.log(Byte2Ascii(P));
    return Byte2Ascii(P);
}
recombine('11adca12',[ 'http://asdadadas!b8e2fb9745b255eed15071f6c1ca9acd1512d2f9458efd2385c83f13f4ab85b5!a298967eb13fb407bd7c84e1ae99f6563b0efaa74041587c436cf973fbc14e124d7b63402cd20ddbace687150e912285!360714dd47241ff17da68e96a20bcf82ca1a40a991127e2981609677c6f314c4',
'http://asdadadas!477dbc226e5772fe7963c97431df19f8bdfc2a1295bb75d588aba709963e4891!cfa8faa5b78ef8ad1a9c6adea2bea363c7c9393088fe0a8d24f92740ef81f19d24bec6a38b41f6624687c35987ef8fea!2ee76cfbba9f52514d2fd482714a2883e4ff6f13da7973d1647336f3a63e63e2',
'http://asdadadas!cc6f82cf3e74f8c2dc2bf983e047ae926dd79bd3f96f6ee591e04309fb22e38e!53b02b67d349fdf52accbac7bd0e9cff1dae787cc793ada6ca87dde8657b4d88cf57d5d46a1b8b112339306055461ad1!47a09e1ba894c6db196ea59e9b8a6c7333ff02b0270343bdcb68faff72da3498',
'http://asdadadas!78077f4e767ba2249e0f6d3bf34b8721f86087f41947f70fd991eb9327e20c63!6cd98ed5f92708095d1ebb156a79d12b13cad5f1d3a68ecea791cbab69701961edfa61920fa6adcde32b28dfe211be9c!a4ccfc73747b784198135375af03c4822d5bb33b9df21ede28a1d1c01ff48fb8'],4,3);

//21922213664822131681821112073920198205482619110322021824287154129121154116242646191111