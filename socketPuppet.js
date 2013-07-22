var sckt = window.WebSocket; // Save for later
var socketPuppets = [];
var hold = null;

WebSocket = function WebSocket(url,protocol) {
    
    // Placeholders for event handlers
    this.onmessage = function(e){};
    this.onopen = function(e){};
    this.onerror = function(e){};
    this.onclose = function(e){};
    
    /*
        Since we cant define readonly attributes 
        we'll use this to reset all the readonly 
        data after every function call
    */
    this.updateStatics = function() {
        this.url = this.sckt.url;
        this.readyState = this.sckt.readyState;
        this.bufferedAmount = this.sckt.bufferedAmount;
        this.extensions = this.sckt.extensions;
        this.protocol = this.sckt.protocol;
        this.binaryType = this.sckt.binaryType;
    };
    
    // Handle passing messages to/from devtools
    this.sendSmokeSignal = function(action, msg)    {
        var payload = {action: action, event: msg};
        window.postMessage({ direction: "out", payload: payload }, "*");
    }
    this.receiveSmokeSignal = function(msg)    {
        if(msg.action == 'send')    {
            try {
                 payload = JSON.parse(msg.payload);
            }
            catch(e)    {
                payload = msg.payload;
            }
            this.sckt.send(payload);
        }
    }
    
    
    
    // Setup actual WebSocket
    this.sckt = new sckt(url,protocol); //reference to the Crhom websocket API
    this.sckt.parent = this; // Need reference to Socket Puppet for events to work
    
    /*
        The code below is meant to emulate teh websocekt interface
        as closely as possible. Some parts of the interface are impossible 
        in javascript, such as the constants. Others are difficult 
        to do 100% correctly due to javascripts asynchronous nature
    */
    this.sckt.onopen = function(e)  {
        e = {
            url: this.url,
            protocol: this.procotol
        }
        
        this.parent.sendSmokeSignal('open', e);
        
        this.parent.onopen(e);
        this.parent.updateStatics();
    };
    this.sckt.onmessage = function(e)  {
        this.parent.sendSmokeSignal('message', e.data);
        this.parent.onmessage(e);
        this.parent.updateStatics();
    };
    this.sckt.onerror = function(e)  {
        this.parent.sendSmokeSignal('error', e);
        this.parent.onerror(e);
        this.parent.updateStatics();
    };
    this.sckt.onclose = function(e)  {
        this.parent.sendSmokeSignal('close', e);
        this.parent.onclose(e);
        this.parent.updateStatics();
    };
    this.send = function(a) {
        this.sendSmokeSignal('send', a);
        return true;
    };
    this.close = function(a,b) {
        this.sendSmokeSignal('close', {a:a, b:b});
        return this.sckt.close(a,b);
    };
    
    // These are supposed to be constants, but sadly we can't (yet)
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    
    // Setup read only attributes
    this.updateStatics();
    
    socketPuppets.push(this);
}
window.WebSocket = WebSocket;

window.addEventListener("message", function(event) {
    // Make sure this message isnt from a third party
    if (event.source != window) return;
    if (event.data.direction && (event.data.direction == "in")) {
        /* 
            Currently we only have support for one socket, but socketpuppet 
            holds all websockets on the page in an array, so we need to send 
            the message to all the sockets. This is mostly placeholder for
            multiple socket support
        */
        for(var i=0; i<socketPuppets.length; i++) {
            socketPuppets[i].receiveSmokeSignal(event.data.payload);
        }
    }
}, false);