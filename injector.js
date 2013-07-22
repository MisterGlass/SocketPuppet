
// Inject SocketPuppet code into the parent window
var elem = document.createElement("script");
elem.type = "text/javascript";
elem.src = chrome.extension.getURL("socketPuppet.js");
(document.head||document.documentElement).appendChild(elem);


/* 
    Because of how chrome does its sandboxing, we cannt communicate between the page
    and the devtools directly. Instead, we need to pass the message along between
    different contexts that are allowed to talk to each other
*/

// Portal to another dimension.... or possibly the dev tools window
var port = chrome.runtime.connect({name:"spContentScript"});
port.onMessage.addListener(function(msg) {
    // Pass messages from the background page to the parent window
    window.postMessage({ direction: "in", payload: msg }, "*");
});

window.addEventListener("message", function(event) {
    // Check that this message is coming from the window (and not a 3rd part)
    if (event.source != window)
      return;

    // Pass messages from the window to the background page
    if (event.data.direction && (event.data.direction == "out")) {
        msg = {};
        msg.payload = event.data.payload;
        msg.tabId = tabId;
        port.postMessage(msg);
    }
}, false);

// Get the ID of parent tab
var tabId;
chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
    tabId = res.tabId;
    var msg = {action: 'link', tabId: tabId};
    port.postMessage(msg);
});