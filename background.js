var devPorts = [];
var spPorts = [];

chrome.extension.onConnect.addListener(function(port) {
    if (port.name !== "spDevTools") return;
    port.onMessage.addListener(function(msg) {
        if(msg.action == 'link')    {
            devPorts[msg.tabId] = port;
            spPorts[msg.tabId] = chrome.tabs.connect(msg.tabId, {name: 'spPortal'});
            spPorts[msg.tabId].onMessage.addListener(function(msg) {
                if(msg.payload.action == 'open') {
                    chrome.browserAction.setIcon({tabId: msg.tabId, path: 'lambchop.on.38.png'});
                    chrome.browserAction.enable(msg.tabId);
                }
                devPorts[msg.tabId].postMessage(msg.payload);
            });
        }
        else    {
            spPorts[msg.tabId].postMessage(msg);
        }
    });
});

// Listen for tabId requests
chrome.extension.onMessage.addListener(
    function(message, sender, sendResponse) {
        if ( message.type == 'getTabId' )
        {
            sendResponse({ tabId: sender.tab.id });
        }
    }
);
/*
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log(tab.id);
});*/
chrome.browserAction.disable();