var elem = document.createElement("script");
elem.type = "text/javascript";
elem.src = chrome.extension.getURL("socketPuppet.js");
(document.head||document.documentElement).appendChild(elem);