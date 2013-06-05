var sckt = window.WebSocket; // Save for later
var socketPuppets = [];
var hold = null;

window.WebSocket = function WebSocket(url,protocol) {
    
    // Placeholders for event functions
    this.onmessage = function(e){};
    this.onopen = function(e){};
    this.onerror = function(e){};
    this.onclose = function(e){};
    
    // Since we cant define readonly attributes (yet?) we'll use this to regrab all the readonly data whenever we're called
    this.updateStatics = function() {
        this.url = this.sckt.url;
        this.readyState = this.sckt.readyState;
        this.bufferedAmount = this.sckt.bufferedAmount;
        this.extensions = this.sckt.extensions;
        this.protocol = this.sckt.protocol;
        this.binaryType = this.sckt.binaryType;
    };
    
    this.sendSmokeSignal = function(action, msg)    {
        var payload = {action: action, event: msg};
        hold = payload; //save the msg to var so i can play with it on cmd line
        window.postMessage({ direction: "out", payload: payload }, "*");
    }
    this.receiveSmokeSignal = function(msg)    {
        //handle input from devtools
        console.log('a');
        console.log(msg);
        if(msg.action == 'send') this.sckt.send(msg.payload);
        else console.log('Error, unkown input received');
    }
    
    
    // Setup actual WebSocket & bind event handlers
    this.sckt = new sckt(url,protocol);
    this.sckt.parent = this; // Need reference to Socket Puppet for events to work
    
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
        console.log('msg: '+e.data);
        this.parent.sendSmokeSignal('message', e.data);
        this.parent.onmessage(e);
        this.parent.updateStatics();
    };
    this.sckt.onerror = function(e)  {
        console.log('error: '+e);
        this.parent.sendSmokeSignal('error', e);
        this.parent.onerror(e);
        this.parent.updateStatics();
    };
    this.sckt.onclose = function(e)  {
        console.log('close: '+e);
        this.parent.sendSmokeSignal('close', e);
        this.parent.onclose(e);
        this.parent.updateStatics();
    };
    
    // These are supposed to be constants, but sadly we can't (yet)
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    
    // Setup send/close functions
    this.send = function(a) {
        console.log('Sent: '+a);
        this.sendSmokeSignal('send', a);
        //return this.sckt.send(a);
        return true;
    };
    this.close = function(a,b) {
        console.log('Closed');
        this.sendSmokeSignal('close', {a:a, b:b});
        return this.sckt.close(a,b);
    };
    
    // Set attributes
    this.updateStatics();
    
    socketPuppets.push(this);
}

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window) return;
    if (event.data.direction && (event.data.direction == "in")) {
        for(var i=0; i<socketPuppets.length; i++) {
            console.log('looped');
            socketPuppets[i].receiveSmokeSignal(event.data.payload);
        }
    }
}, false);