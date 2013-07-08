var devPorts = [];
var spPorts = [];


chrome.extension.onConnect.addListener(function(port) {
    if (port.name == "spDevTools")  {
        port.onMessage.addListener(function(msg) {
            if(msg.action == 'link')    {
                console.log('linked to dt '+msg.tabId);
                devPorts[msg.tabId] = port;
            }
            else if(msg.action == 'save')   {
                chrome.tabs.create({url: 'data:text;base64,'+btoa(msg.payload), active:false});
            }
            else    {
                console.log('post to cs '+msg.tabId);
                spPorts[msg.tabId].postMessage(msg);
            }
        });
    }
    else if(port.name == "spContentScript") {
        port.onMessage.addListener(function(msg) {
            if(msg.action == 'link')    {
                console.log('linked to cs '+msg.tabId);
                spPorts[msg.tabId] = port;
            }
            else    {
                if(typeof devPorts[msg.tabId] != 'undefined')   {
                    console.log('post to dt '+msg.tabId);
                    devPorts[msg.tabId].postMessage(msg.payload);
                }
                else    {
                    console.log('DT '+msg.tabId+' not connected');
                    if(msg.payload.action == 'send') {
                        console.log('bounce send back to cs '+msg.tabId);
                        spPorts[msg.tabId].postMessage({action: 'send', payload: msg.payload.event, tabId: msg.tabId});
                    }
                }
            }
        });
    }
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