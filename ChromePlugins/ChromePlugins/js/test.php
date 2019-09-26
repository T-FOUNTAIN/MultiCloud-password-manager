<?php
    $name = $_POST['username'];
    $pwd = $_POST['password'];
    $mySQL = new mysqli('localhost', 'root', 'wyz199910', 'test');
    $mySQLi -> connect_errno;
    $mySQLi -> set_charset('utf8');

    $sql = "INSERT INTO 表1 (用户名,密码)
	VALUES ('$name','$pwd');";
	$res = $mySQLi -> query($sql);
		
    echo json_encode(0);
?>