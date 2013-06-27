var i = 0;
logEvent = function(msg)    {
    i++;
    var ul = document.getElementById('events');
    var li = document.createElement("li");
    li.id = "event"+i;
    li.appendChild(document.createTextNode(i+' - '+msg));
    
    if(i>1) ul.insertBefore(li, document.getElementById("event"+(i-1)));
    else    ul.appendChild(li);
}
sendMessage = function(msg)  {
    portal.postMessage({action: 'send', payload: msg, tabId: chrome.devtools.inspectedWindow.tabId});
    logEvent('Sent message: '+msg);
}
handleOpen = function(msg)  {
    logEvent('new socket opened');
}
handleMessage = function(msg)  {
    logEvent('Received message: '+msg);
}
handleSend = function(msg)  {
    if(document.getElementById('interrupt').checked)   {
        msg = prompt('Client wants to send "'+msg+'". What should the response be?', msg);
    }
    sendMessage(msg);
}
handleError = function(msg)  {
    logEvent('socket triggered error');
}
handleClose = function(msg)  {
    logEvent('socket closed by server');
}


var portal = chrome.extension.connect({name:"spDevTools"});
var msg = {
    action: 'link',
    tabId: chrome.devtools.inspectedWindow.tabId
}
portal.postMessage(msg);


portal.onMessage.addListener(function(msg) {
    if(msg.action == 'open') handleOpen(msg.event);
    else if(msg.action == 'message') handleMessage(msg.event);
    else if(msg.action == 'send') handleSend(msg.event);
    else if(msg.action == 'error') handleError(msg.event);
    else if(msg.action == 'close') handleClose(msg.event);
    else logEvent('error unhandled msg');
});



window.onload = function() {
    var form = document.getElementById('sendMsg');
    form.onsubmit = function() {
        sendMessage(document.getElementById('msgInput').value);
        return false;
    }
}