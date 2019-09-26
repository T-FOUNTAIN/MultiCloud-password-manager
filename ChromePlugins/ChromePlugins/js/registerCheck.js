$('#registerButton').on('click', function(){
    var username = $('input[name="userName"]').val();
    var password = $('input[name="passWord"]').val();
    var password_con = $('input[name="passWord_2"]').val();

    if (username=="" || password==""){
        alert('输入不能为空！');
    }
    else if (password.length < 6){
        alert('密码不能小于6个字节');
    }
    else if (password != password_con){
        alert('两次密码输入不一致');
    }else {
        console.log('POST ready!');
        $.ajax({  
            type:"POST",  
            url:"http://localhost:8080/test.php",
            dataType:"json",  
            data:{username: username, password: password}, 
            success: function(status){  
                if(status == 0){
                    console.log('yes!');
                }  
            },  
            error: function(e){  
                alert(e.responseText);
            }  
        }) 
    }

});
