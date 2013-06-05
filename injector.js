var elem = document.createElement("script");
elem.type = "text/javascript";
elem.src = chrome.extension.getURL("socketPuppet.js");
(document.head||document.documentElement).appendChild(elem);

var portal; // Portal to another dimension.... or possibly the dev tools window
var tabId; // hold the tabId
chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
    tabId = res.tabId;
});

var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.direction && (event.data.direction == "out")) {
        msg = {};
        msg.payload = event.data.payload;
        msg.tabId = tabId;
        portal.postMessage(msg);
    }
}, false);


chrome.runtime.onConnect.addListener(function(port) {
    portal = port;
    port.onMessage.addListener(function(msg) {
        window.postMessage({ direction: "in", payload: msg }, "*");
    });
});