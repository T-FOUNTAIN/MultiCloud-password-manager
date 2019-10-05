$(document).ready(function(){
    //以下是content-script.js监听background.js发送的信息的内容
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            var active = request.active;
            console.log("active: "+ active);
            var hostname = window.location.hostname;
            chrome.runtime.sendMessage(
                {hostname: hostname},
                function(response) {
                    console.log(response.callback);
                }
            );
    });
});

