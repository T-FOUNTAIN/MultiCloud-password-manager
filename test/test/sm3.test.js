const sm3 = require('../function/sm3_index');

console.log(sm3('588acc8288185346f5d3f11a91fbbe086e4f1c0366d6d1cea1def055165b4e88e28e20e0bafb78a2aec54e6c707b01e33e2ee2f8adf6c983cfe6b4f81afd22a97490e47807f0cf15da0af47f7221feed',0,0));

/*
test('must match the result', () => {
    expect(sm3('abc')).toBe('66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0');

    expect(sm3('abcdefghABCDEFGH12345678')).toBe('d670c7f027fd5f9f0c163f4bfe98f9003fe597d3f52dbab0885ec2ca8dd23e9b');

    expect(sm3('abcdefghABCDEFGH12345678abcdefghABCDEFGH12345678abcdefgh')).toBe('1cf3bafec325d7d9102cd67ba46b09195af4e613b6c2b898122363d810308b11');

    expect(sm3('abcdefghABCDEFGH12345678abcdefghABCDEFGH12345678abcdefghABCD')).toBe('b8ac4203969bde27434ce667b0adbf3439ee97e416e73cb96f4431f478a531fe');

    expect(sm3('abcdefghABCDEFGH12345678abcdefghABCDEFGH12345678abcdefghABCDEFGH')).toBe('5ef0cdbe0d54426eea7f5c8b44385bb1003548735feaa59137c3dfe608aa9567');
    
    expect(sm3('abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd')).toBe('debe9ff92275b8a138604889c18e5a4d6fdb70e5387e5765293dcba39c0c5732');
});*/
