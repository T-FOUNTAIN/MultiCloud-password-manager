var hostname = 'null';
//以下是background.html监听content-script.js发送的信息的内容
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        hostname = request.hostname;
        console.log(sender.tab ? "from a content script:" + sender.tab.url: "error");
        console.log('已为您自动填写该网站主机域名'+hostname);
        sendResponse({callback: "网站主机域名："+ hostname});
});
//以下是background页面向content-scripts发送信息的函数
function sendToContent(){
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {active:'on'});
    });
}
//------------------------------------------分割线--------------------------------------------------

//------------------------------------------分割线--------------------------------------------------
$(document).ready(function(){
    //页面的淡出淡入特效
    $(document).ready(function(){
        $('#inputArea_register, #registerArea, #foot_register').hide().fadeIn(300);
        $('#ModeArea, #ModeFoot').hide().fadeIn(300);
        $('#mpArea, #mpConfirm, #mpFoot').hide().fadeIn(300);
    });

    //--------------------------------------分割线-----------------------------------------------
    //以下是register.html相关的js
    //注册界面的“登录”事件绑定
    $('#login a').on('click', function(){
        $('#inputArea_register, #registerArea, #foot_register').fadeOut(300, function(){
            window.location.href = "../popup.html";
        });
    });

    //注册界面的“注册”按钮事件绑定
    $('#registerButton').on('click', function(){
        var username = $('input[name="userName"]').val();
        var password = $('input[name="passWord"]').val();
        var password_con = $('input[name="passWord_2"]').val();
        //判断输入是否为空
        if (username=="" || password==""){
            $('#inputArea_register').append('<div class="errorTip"><p>输入不能为空</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }
        //判断输入的口令长度
        else if (password.length < 6){
            $('#inputArea_register').append('<div class="errorTip"><p>口令长度不能小于6字节</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }
        //判断两次口令输入的是否一致
        else if (password != password_con){
            $('#inputArea_register').append('<div class="errorTip"><p>两次口令输入不一致</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else{
            //将注册信息发送到服务端
            password = hex_md5(password);
            $.ajax({  
                type: "POST",
                url: "http://123.56.44.200/Plug_in_register.php",
                dataType: "json",
                data: {username: username, password: password}, 
                success: function(status){  
                    console.log('发送至服务端成功');
                    if(status == 0){
                        //“注册成功”显示1000ms后返回登陆页面
                        $('#inputArea_register').append('<div class="successTip"><p>注册成功</p></div>');
                        setTimeout(function(){
                            $('#inputArea_register, #registerArea, #foot_register').fadeOut(300, function(){
                                window.location.href = "../popup.html";
                            });
                        }, 1000);
                    }else if(status == 1){
                        //该用户名已存在的保存提示
                        $('#inputArea_register').append('<div class="errorTip"><p>用户名已存在</p></div>');
                        $('.errorTip').fadeOut(2000, function(){
                            $('.errorTip').remove();
                        });
                    }
                },  
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    $('#inputArea_register').append('<div class="errorTip"><p>网络状态不佳</p></div>');
                    $('.errorTip').fadeOut(2000, function(){
                        $('.errorTip').remove();
                    });
                }
            });
        }
    });

    //注册界面点击“小眼睛”查看密码的事件绑定
    $('.eye').on('mousedown', function(){
        $("#password_register input, #MP_input input").attr("type","text");
    });
    $('.eye').on('mouseup', function(){
        $("#password_register input, #MP_input input").attr("type","password");
    });

    //--------------------------------------分割线-----------------------------------------------

    //以下是setMP.html相关的js
    //主口令设置界面按钮的事件绑定
    $('#mpButton').on('click', function(){
        var MP = $('input[name="MP"]').val();
        var MP_con = $('input[name="MP_con"]').val();
        //判断输入是否为空
        if (MP==""){
            $('#mpArea').append('<div class="errorTip"><p>输入不能为空</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }
        //判断输入的口令长度
        else if (MP.length < 8){
            $('#mpArea').append('<div class="errorTip"><p>主口令长度不能小于8字节</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }
        //判断两次口令输入的是否一致
        else if (MP != MP_con){
            $('#mpArea').append('<div class="errorTip"><p>两次主口令输入不一致</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else {
            //哈希值存入localstorage
            MP_hash = hex_md5(MP);
            username = localStorage.getItem('username');
            localStorage.setItem('MPhash', MP_hash);
            localStorage.setItem('status', 'online');
            $('#mpArea, #mpConfirm, #mpFoot').fadeOut(300, function(){
                $('#mpArea, #mpConfirm, #mpFoot').remove();
                window.location.href = '../html/options.html';
            });
        }
    });
    
    //主口令的介绍
    $('#MPintro').on('mouseup', function(){
        swal('主口令',"对于本系统的用户来说，主口令是最重要的一个口令。主口令可以帮助用户进行所有web站点口令的存储，查询以及新web站点口令的生成，重要的一点是，主口令是不能更换的！");
    });

    //--------------------------------------分割线-----------------------------------------------
    //以下是options.html相关的js元素
    //“登出”按钮的事件绑定
    $('#logout a').on('click', function(){
        //清空localStorage
        localStorage.clear();
        $('#ModeArea, #ModeFoot, #inputArea_mode').fadeOut(300, function(){
            $('#ModeArea, #ModeFoot, #inputArea_mode').remove();
            window.location.href = '../popup.html';
        });
    });

    $('.get').on('click', function(){
        sendToContent();
        setTimeout(function(){
            $('input[name="web_hostname"]').val(hostname);
        }, 500);
    });

    //生成强口令
    $('#genPassword').on('click', function(){
        var webHostname = $('input[name="web_hostname"]').val();
        var webUsername = $('input[name="web_username"]').val();
        var MainPwd = $('input[name="MP_options"').val();
        var localMPhash = localStorage.getItem('MPhash');
        var timestamp = (new Date()).valueOf();
        if(webHostname == "" || webUsername == "" || MainPwd == ""){
            $('#inputArea_mode').append('<div class="errorTip"><p>输入不能为空</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else if(hex_md5(MainPwd) != localMPhash){
            $('#inputArea_mode').append('<div class="errorTip"><p>主口令输入不正确</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else{
            //console.log($.base64.encode(webHostname));
            webuserName_base64 = $.base64.encode(webUsername);
            MP_base64 = $.base64.encode(MainPwd);
            time_base64 = $.base64.encode(timestamp);
            //这里是生成口令的过程
            swal({
                title: "Are you sure?",
                text: "这可能需要几秒钟的时间",
                icon: "../img/timg.gif",
                buttons: true,
              })
              .then((willDelete) => {
                if (willDelete) {
                    var webpwd = password_gen(webuserName_base64,MP_base64,time_base64,1);
                    $('input[name="web_password"]').val(webpwd);
                } else {
                  swal("你也可以自己设置该网站的登录口令");
                }
                });
        }  
    });

    //查询强口令
    $('#getPassword').on('click', function(){
        var webHostname = $('input[name="web_hostname"]').val();
        var MainPwd = $('input[name="MP_options"').val();
        var localMPhash = localStorage.getItem('MPhash');
        if(webHostname == "" || MainPwd == ""){
            $('#inputArea_mode').append('<div class="errorTip"><p>输入不能为空</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else if(hex_md5(MainPwd) != localMPhash){
            $('#inputArea_mode').append('<div class="errorTip"><p>主口令输入不正确</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else{
            var userNow = localStorage.getItem('username');
            var block1, block2, block3, block4;
            $.ajax({ 
                type: "POST",
                url: "http://123.56.44.200/Web_login.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname}, 
                success: function(datablock){  
                    if(datablock != ""){
                        block1 = datablock;
                    }else if(datablock == 1){
                        console.log('服务器1没查到');
                    }
                },
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    console.log('获取服务器1数据失败');
                }
            });
            $.ajax({ 
                type: "POST",
                url: "http://192.144.217.94/Web_login.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname}, 
                success: function(datablock){  
                    if(datablock != ""){
                        block2 = datablock;
                    }else if(datablock == 1){
                        console.log('服务器2没查到');
                    }
                },
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    console.log('获取服务器2数据失败');
                }
            });
            $.ajax({ 
                type: "POST",
                url: "http://101.200.149.198/Web_login.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname}, 
                success: function(datablock){  
                    if(datablock != ""){
                        block3 = datablock;
                    }else if(datablock == 1){
                        console.log('服务器3没查到');
                    }
                },
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    console.log('获取服务器3数据失败');
                }
            });
            $.ajax({ 
                type: "POST",
                url: "http://49.232.59.84/Web_login.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname}, 
                success: function(datablock){  
                    if(datablock != ""){
                        block4 = datablock;
                    }else if(datablock == 1){
                        console.log('服务器4没查到');
                    }
                },
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    console.log('获取服务器4数据失败');
                }
            });

            setTimeout(function(){
                /*console.log(block1);
                console.log(block2);
                console.log(block3);
                console.log(block4);*/
                 //上面ajax × 4 获取到全部数据之后进行处理
                var webPwd = recombine([block1,block2,block3,block4],4,3,MainPwd).Site_Password;
                var webUsn = recombine([block1,block2,block3,block4],4,3,MainPwd).Site_Username;
                $('#inputArea_mode').append('<div class="successTip"><p>查询成功</p></div>');
                $('.successTip').fadeOut(2000, function(){
                    $('.successTip').remove();
                });
                $('input[name="web_password"]').val(webPwd);
                $('input[name="web_username"]').val(webUsn);
            }, 700)
           
        }  
    });

    //上传强口令
    $('#savePassword').on('click', function(){
        var webHostname = $('input[name="web_hostname"]').val();
        var webUsername = $('input[name="web_username"]').val();
        var MainPwd = $('input[name="MP_options"').val();
        var localMPhash = localStorage.getItem('MPhash');
        var webPwd = $('input[name="web_password"').val();
        if(webHostname == "" || webUsername == "" || MainPwd == "" || webPwd == ""){
            $('#inputArea_mode').append('<div class="errorTip"><p>输入不能为空</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else if(hex_md5(MainPwd) != localMPhash){
            $('#inputArea_mode').append('<div class="errorTip"><p>主口令输入不正确</p></div>');
            $('.errorTip').fadeOut(2000, function(){
                $('.errorTip').remove();
            });
        }else{
            var userNow = localStorage.getItem('username');
            var datablock_1, datablock_2, datablock_3, datablock_4;

            datablocks = divide(webUsername,webPwd,MainPwd,4,3,webHostname);
            datablock_1 = datablocks[0];
            datablock_2 = datablocks[1];
            datablock_3 = datablocks[2];
            datablock_4 = datablocks[3];
            
            $.ajax({ 
                type: "POST",
                url: "http://123.56.44.200/Web_register.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname, datablock: datablock_1}, 
                success: function(status){  
                    if(status == 0){
                        console.log('上传到服务器1成功');
                    }else{
                        console.log('上传至数据库失败');
                    }
                }, 
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    $('#inputArea_mode').append('<div class="errorTip"><p>网络状态不佳</p></div>');
                    $('.errorTip').fadeOut(2000, function(){
                        $('.errorTip').remove();
                    });
                }
            });
            $.ajax({ 
                type: "POST",
                url: "http://192.144.217.94/Web_register.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname, datablock: datablock_2}, 
                success: function(status){  
                    if(status == 0){
                        console.log('上传到服务器2成功')
                    }else{
                        console.log('上传至数据库失败');
                    }
                },  
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    $('#inputArea_mode').append('<div class="errorTip"><p>网络状态不佳</p></div>');
                    $('.errorTip').fadeOut(2000, function(){
                        $('.errorTip').remove();
                    });
                }
            });
            $.ajax({ 
                type: "POST",
                url: "http://101.200.149.198/Web_register.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname, datablock: datablock_3}, 
                success: function(status){  
                    if(status == 0){
                        console.log('上传到服务器3成功')
                    }else{
                        console.log('上传至数据库失败');
                    }
                },  
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    $('#inputArea_mode').append('<div class="errorTip"><p>网络状态不佳</p></div>');
                    $('.errorTip').fadeOut(2000, function(){
                        $('.errorTip').remove();
                    });
                }
            });
            $.ajax({ 
                type: "POST",
                url: "http://49.232.59.84/Web_register.php",
                dataType: "json",
                data: {username: userNow, hostname: webHostname, datablock: datablock_4}, 
                success: function(status){  
                    if(status == 0){
                        console.log('上传到服务器4成功')
                    }else{
                        console.log('上传至数据库失败');
                    }
                },  
                error: function(e){  
                    console.log(e.responseText);
                    //ajax传输失败报错提示
                    $('#inputArea_mode').append('<div class="errorTip"><p>网络状态不佳</p></div>');
                    $('.errorTip').fadeOut(2000, function(){
                        $('.errorTip').remove();
                    });
                }
            });
            $('#inputArea_mode').append('<div class="successTip"><p>上传成功</p></div>');
            $('.successTip').fadeOut(2000, function(){
                $('.successTip').remove();
            });
        }  
    });

    $('.eye').on('mousedown', function(){
        $("#MP_op input").attr("type","text");
    });
    $('.eye').on('mouseup', function(){
        $("#MP_op input").attr("type","password");
    });
    $('.write').on('click', function(){
        $('#web_pwd input').removeAttr("readonly");
    })
    //--------------------------------------分割线-----------------------------------------------
});
