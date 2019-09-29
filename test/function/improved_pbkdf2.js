/**
 * 左补0到指定长度 输入为二进制字符串 输出为字符串
 */
function leftPad(input, num) {
    if (input.length >= num) return input;

    return (new Array(num - input.length + 1)).join('0') + input
}

/**
 * 二进制转化为十六进制 输出位字符串
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
 * 十六进制转化为二进制 输出为字符串
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
 * 普通字符串转化为二进制 输出为字符串
 */
function str2binary(str) {
    let binary = '';
    for (const ch of str) {
        binary += leftPad(ch.codePointAt(0).toString(2), 8);
    }
    return binary;
}

/**
 * 循环左移
 */
function rol(str, n) {
    return str.substring(n % str.length) + str.substr(0, n % str.length);
}

/**
 * 二进制运算
 */
function binaryCal(x, y, method) {
    const a = x || '';
    const b = y || '';
    const result = [];
    let prevResult;

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



const hlen = 32;
const random = require('./RandomNum');
//console.log(random(32));
const sm3 = require('../function/sm3_index');
//const BigNumber=require('../function/bignumber');

//我的整体想法是 全部转换为二进制字符串利用上面的binarycal函数运算 

/*
    *因为该函数模块是直接接受salt和MP
    *salt初始状态为十六进制数组，MP初始状态为base64编码 都易于转为二进制，则使用二进制字符串输入
    *Klen希望输出长度是字节数
*/

//hmac中的分组函数 这里b取定为512
const b = 512;

const ipad = [0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36, 0x36,0x36,
    0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36]

const opad = [0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,
        0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c,0x5c]


iPad = str2binary(Bytes2Str(ipad));
oPad = str2binary(Bytes2Str(opad));
//mp为输入为普通字符串形式
//输出为二进制字符串
function padding(MP){
    var mp = str2binary(MP);
    mp = (mp.length>b?sm3(mp,1,1):mp);
    return leftPad(mp,b);
}


//Pwd输入为base64字符串形式 ，salt是random出的字节数组
function PBKDF2(Pwd,salt,iterations,Klen){
    var OUT ='';
    r = Math.ceil(Klen/hlen);
    K = padding(Pwd);
    X = sm3(binaryCal(K,iPad,xor),1,1);
    Z = sm3(binaryCal(K,opad,xor),1,1);

    for(var i = 0;i < r;i++){
        T = str2binary(Bytes2Str(salt))+i.toString(2);
        Y = sm3(X+T,1,1);
        T = sm3(Z+Y,1,1);
        U = T;
        for(var j = 0;j< iterations;j++){
            Y = sm3(X+Y,1,1);
            T = sm3(Z+Y,1,1);
            U = binaryCal(U,T,xor); 
        }
        OUT = OUT+U;   
    }
    return binary2hex(OUT).substring(0,Klen*2);
} 


/*
function PBKDF2(Pwd,salt,iterations,Klen){
    var OUT ='';
    r = Math.ceil(Klen/hlen);
    K = new BigNumber(padding(Pwd));
    X = sm3(K.xor(iPad).toString(2),1,1);
    Z = sm3(K.xor(oPad).toString(2),1,1);

    for(var i = 0;i < r;i++){
        T = str2binary(Bytes2Str(salt))+i.toString(2);
        Y = sm3(X+T,1,1);
        T = sm3(Z+Y,1,1);
        U = T;
        for(var j = 0;j< iterations;j++){
            Y = sm3(X+Y,1,1);
            T = sm3(Z+Y,1,1);
            U = binaryCal(U,T,xor); 
        }
        OUT = OUT+U;   
    }
    return binary2hex(OUT).substring(0,hlen*2);
} 
*/
module.exports= {
   pbkdf2(Pwd,salt,Klen){
       return PBKDF2(Pwd,salt,200,Klen);
   }
};