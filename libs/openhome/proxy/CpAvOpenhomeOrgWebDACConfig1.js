 

/**
* Service Proxy for CpProxyAvOpenhomeOrgWebDACConfig1
* @module ohnet
* @class WebDACConfig
*/
    
var CpProxyAvOpenhomeOrgWebDACConfig1 = function(udn){ 

    this.url = window.location.protocol + "//" + window.location.host + "/" + udn + "/av.openhome.org-WebDACConfig-1/control";  // upnp control url
    this.domain = "av-openhome-org";
    this.type = "WebDACConfig";
    this.version = "1";
    this.serviceName = "av.openhome.org-WebDACConfig-1";
    this.subscriptionId = "";  // Subscription identifier unique to each Subscription Manager 
    this.udn = udn;   // device name
    
    // Collection of service properties
    this.serviceProperties = {};
    this.serviceProperties["Alive"] = new ohnet.serviceproperty("Alive","bool");
    this.serviceProperties["DACConfig"] = new ohnet.serviceproperty("DACConfig","string");

                
}



/**
* Subscribes the service to the subscription manager to listen for property change events
* @method Subscribe
* @param {Function} serviceAddedFunction The function that executes once the subscription is successful
*/
CpProxyAvOpenhomeOrgWebDACConfig1.prototype.subscribe = function (serviceAddedFunction) {
    ohnet.subscriptionmanager.addService(this,serviceAddedFunction);
}


/**
* Unsubscribes the service from the subscription manager to stop listening for property change events
* @method Unsubscribe
*/
CpProxyAvOpenhomeOrgWebDACConfig1.prototype.unsubscribe = function () {
    ohnet.subscriptionmanager.removeService(this.subscriptionId);
}


    

/**
* Adds a listener to handle "Alive" property change events
* @method Alive_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgWebDACConfig1.prototype.Alive_Changed = function (stateChangedFunction) {
    this.serviceProperties.Alive.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readBoolParameter(state)); 
    });
}
    

/**
* Adds a listener to handle "DACConfig" property change events
* @method DACConfig_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgWebDACConfig1.prototype.DACConfig_Changed = function (stateChangedFunction) {
    this.serviceProperties.DACConfig.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readStringParameter(state)); 
    });
}


/**
* A service action to GetDACConfig
* @method GetDACConfig
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebDACConfig1.prototype.GetDACConfig = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetDACConfig", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["DACConfig"] = ohnet.soaprequest.readStringParameter(result["DACConfig"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to SetDACConfig
* @method SetDACConfig
* @param {String} DACConfig An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebDACConfig1.prototype.SetDACConfig = function(DACConfig, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetDACConfig", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("DACConfig", DACConfig);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}



