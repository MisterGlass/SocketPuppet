var i = 0;
var j = 0;
var filters = new Array();

saveToFile = function(link) {
    content = '';
    var ul = document.getElementById('events');
    for(var j = ul.children.length-1; j>=0; j--)    {
        content += ul.children[j].innerHTML+"\r\n";
    }
    portal.postMessage({action: 'save', payload: content, tabId: chrome.devtools.inspectedWindow.tabId});
}

logEvent = function(msg)    {
    var d, hours, minutes, seconds, ul, li;
    i++;
    ul = document.getElementById('events');
    li = document.createElement("li");
    li.id = "event"+i;
    
    d = new Date();
    hours = d.getHours();
    if(hours < 10) hours = "0" + hours;
    minutes = d.getMinutes();
    if(minutes < 10) minutes = "0" + minutes;
    seconds = d.getSeconds();
    if(seconds < 10) seconds = "0" + seconds;
    d = d.getMonth()+'/'+d.getDate()+'/'+d.getFullYear()+' '+hours+':'+minutes+':'+seconds;
    
    li.innerHTML =  d+' - '+msg;
    
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
    logEvent('Received message: '+JSON.stringify(msg));
}
handleSend = function(msg)  {
    
    logEvent('Page asked to send: '+msg);
    
    //You can add additional logic here for more complex message filtering
    
    
    filters.forEach(function(element){
        msg = msg.replace(element.regex, element.replacement)
    })

    if(document.getElementById('interrupt').checked)   {
        msg = prompt('Page wants to send "'+msg+'". What should the message be?', msg);
    }
    
    sendMessage(msg);
}
handleError = function(msg)  {
    logEvent('socket triggered error handler');
}
handleClose = function(msg)  {
    logEvent('socket closed');
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
    var save = document.getElementById('save');
    save.onclick = function() {
        saveToFile();
        return false;
    }
    var add = document.getElementById('add');
    add.onclick = function() {
        regex = prompt('What would you like to filter out? (regex)');
        replacement = prompt('What would you like to repalce it with? (string)');
        regex = new RegExp(regex, "g");
        filters.push({regex: regex, replacement: replacement});
        
        j++;
        ul = document.getElementById('filters');
        li = document.createElement("li");
        li.id = "filter"+j;
        
        li.innerHTML =  regex+' - '+replacement;
        ul.appendChild(li);
    }
}