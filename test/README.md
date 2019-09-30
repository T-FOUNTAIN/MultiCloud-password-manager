# 说明文档

#### 使用

- 真正使用文件：module文件夹中的passwordGen.js/divideModuleV2.js/reCombineModuleV2.js文件

##### passwordGen.js

- 主函数：password_gen(Site_UserName,MP,T,mode)

  返回一段生成口令，字符长度随机在6-18之间 ，数字大小写字母可能有特殊字符的字符串

  - Site_UserName：网站用户名  base64
  - MPT：主口令 base64
  - mode：两种模式[int] （该参数为0：不含特殊字符；1：含有特殊字符/通常为等号或者下划线或者加号）

  ![1569826468382](\assets\1569826468382.png)

  ![1569826454462](\assets\1569826454462.png)

##### divideModuleV2.js

- divide(siteUsername,sitePassword,Msg,n,k,URL)

  返回一个数组，数组的每个元素是上传到不同网站的分片

  比如n个网站，则数组为n维

  - Site_UserName：网站用户名  base64

  - Site_UserName：网站密码 base64

  - Msg：预留信息 base64 用于私底下验证消息恢复的正确性 比如’buaanb‘这种

  - n：主机数 k：门限数

  - URL：域名 base64

    输出：

  ![1569826562789](\assets\1569826562789.png)

  
##### reCombineModuleV2.js

function recombine(Data,n,k,Msg)

  ​	返回一个键值对集合，是网站username和网站password

- Data：上一个模块生成的数组，类似这种格式：

![1569826801289](\assets\1569826801289.png) 

就是把预留信息套在一个数组就成

  - Msg：预留信息 base64 用于私底下验证消息恢复的正确性 比如’buaanb‘这种

  - n：主机数 k：门限数

    输出：![1569826846582](\assets\1569826846582.png)


#### 注意事项：

- 最外层test文件夹中的module模块是需要用到的，但其中js文件对function文件夹内js文件有引用，所以不要改变test文件夹内文件的相对路径！
- 传入必须为base64编码！
- 预留信息不可以含"!"字符
- 分片放在数组里传入的顺序 必须和 上传的分片对应相同

