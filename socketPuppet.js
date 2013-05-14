var sckt = window.WebSocket; // Save for later

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
    
    // Setup actual WebSocket & bind event handlers
    this.sckt = new sckt(url,protocol);
    this.sckt.parent = this; // Need reference to Socket Puppet for events to work
    
    this.sckt.onopen = function(e)  {
        console.log('open: '+e);
        this.parent.onopen(e);
        this.parent.updateStatics();
    }
    this.sckt.onmessage = function(e)  {
        console.log('msg: '+e);
        this.parent.onmessage(e);
        this.parent.updateStatics();
    }
    this.sckt.onerror = function(e)  {
        console.log('error: '+e);
        this.parent.onerror(e);
        this.parent.updateStatics();
    }
    this.sckt.onclose = function(e)  {
        console.log('close: '+e);
        this.parent.onclose(e);
        this.parent.updateStatics();
    }
    
    // These are supposed to be constants, but sadly we can't (yet)
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    
    // Setup send/close functions
    this.send = function(a) {
        console.log('Sent: '+a);
        return this.sckt.send(a);
    }
    this.close = function(a,b) {
        console.log('Closed');
        return this.sckt.close(a,b);
    }
    
    // Set attributes
    this.updateStatics();
}
