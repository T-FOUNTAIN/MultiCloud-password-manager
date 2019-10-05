//从用的localhost获取用户名和主密钥，如果都存在就直接跳转到选项界面
var userNow = localStorage.getItem('username');
var MP_hash = localStorage.getItem('MPhash');
if (userNow != null && MP_hash != null){
    var status = localStorage.getItem('status');
    if(status == 'online'){
            window.location.href = "html/options.html";
    }
}

$(document).ready(function(){
    //淡入淡出的特效
    $('#inputArea, #loginArea, #foot').hide().fadeIn(300);
    //“立即注册”按钮的事件
    $('#register p').on('click', function(){
        $('#inputArea, #loginArea, #foot').fadeOut(300, function(){
            $('#inputArea, #loginArea, #foot').remove();
            window.location.href = "html/register.html";
        });
    })

    //“登录”按钮的事件
    $('#loginButton').on('click', function(){
        var username = $('input[name="userName"]').val();
        var password = $('input[name="passWord"]').val();
        password = hex_md5(password);
        //上传到服务器进行比对
        $.ajax({
            type: "POST",
            url: "http://123.56.44.200/Plug_in_login.php",
            dataType: "json",
            data: {username: username, password: password},
            success: function(status){
                console.log('发送至服务器成功');
                if(status == 0){
                    //元素淡出并且删除
                    $('#inputArea').fadeOut(300, function(){
                        $('#inputArea').remove();
                    });
                    $('#loginArea').fadeOut(300, function(){
                        $('#loginArea').remove();
                    });
                    $('#foot').fadeOut(300, function(){
                        $('#foot').remove();
                        localStorage.setItem('username', username);
                        window.location.href = "html/setMP.html";
                    });

                }else if(status == 1){
                    $('#inputArea').append('<div class="errorTip"><p>用户名或密码错误</p></div>');
                    $('.errorTip').fadeOut(2000, function(){
                    $('.errorTip').remove();
                    });
                }
            }
        });
    });

    //密码输入框点击眼睛可以显示密码明文的特效
    $('.eye').on('mousedown', function(){
        $("#password_login input").attr("type","text");
    });
    $('.eye').on('mouseup', function(){
        $("#password_login input").attr("type","password");
    });

});
