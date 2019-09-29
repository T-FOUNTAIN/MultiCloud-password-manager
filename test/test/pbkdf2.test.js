
const random = require('../function/RandomNum');
const salt = random(32);
//console.log(salt);

const pbkdf2 = require("../function/improved_pbkdf2").pbkdf2;
console.log(pbkdf2("tfountain",salt,8));