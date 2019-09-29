/*给定字节数，返回相应长度十六进制字节数组
    用于构造salt
*/
module.exports = function(Klen){
    var csprng = require("crypto");
    return csprng.randomBytes(32);
}
