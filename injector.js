var elem = document.createElement("script");
elem.type = "text/javascript";
elem.src = chrome.extension.getURL("socketPuppet.js");
(document.head||document.documentElement).appendChild(elem);

// Portal to another dimension.... or possibly the dev tools window
var port = chrome.runtime.connect({name:"spContentScript"});
port.onMessage.addListener(function(msg) {
    window.postMessage({ direction: "in", payload: msg }, "*");
});

var tabId; // hold the tabId
chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
    tabId = res.tabId;
    var msg = {action: 'link', tabId: tabId};
    port.postMessage(msg);
});

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.direction && (event.data.direction == "out")) {
        msg = {};
        msg.payload = event.data.payload;
        msg.tabId = tabId;
        port.postMessage(msg);
    }
}, false);