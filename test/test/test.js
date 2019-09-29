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
function unpad(array){
    const del = array[0];
    for(var i =0;i<del;i++)array.shift();
}

/*字节转字符 ASCII*/
function Byte2str(Byte){
    let str = '';
    for(var i = 0;i<Byte.length;i++){
        str+=String.fromCharCode(Byte[i]);
    }
    return str;
}
b = Byte2str([45,1,2,36,2,3,32]);
console.log(b);

var a = [ 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 21, 1, 3 ];
pad(a);
console.log(a);
unpad(a);
console.log(a);