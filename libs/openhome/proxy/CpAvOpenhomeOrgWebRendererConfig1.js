 

/**
* Service Proxy for CpProxyAvOpenhomeOrgWebRendererConfig1
* @module ohnet
* @class WebRendererConfig
*/
    
var CpProxyAvOpenhomeOrgWebRendererConfig1 = function(udn, host){ 

    this.url = window.location.protocol + "//" + host + "/" + udn + "/av.openhome.org-WebRendererConfig-1/control";  // upnp control url
    this.domain = "av-openhome-org";
    this.type = "WebRendererConfig";
    this.version = "1";
    this.serviceName = "av.openhome.org-WebRendererConfig-1";
    this.subscriptionId = "";  // Subscription identifier unique to each Subscription Manager 
    this.udn = udn;   // device name
    
    // Collection of service properties
    this.serviceProperties = {};
    this.serviceProperties["RendererConfig"] = new ohnet.serviceproperty("RendererConfig","string");

          
}



/**
* Subscribes the service to the subscription manager to listen for property change events
* @method Subscribe
* @param {Function} serviceAddedFunction The function that executes once the subscription is successful
*/
CpProxyAvOpenhomeOrgWebRendererConfig1.prototype.subscribe = function (serviceAddedFunction) {
    ohnet.subscriptionmanager.addService(this,serviceAddedFunction);
}


/**
* Unsubscribes the service from the subscription manager to stop listening for property change events
* @method Unsubscribe
*/
CpProxyAvOpenhomeOrgWebRendererConfig1.prototype.unsubscribe = function () {
    ohnet.subscriptionmanager.removeService(this.subscriptionId);
}


    

/**
* Adds a listener to handle "RendererConfig" property change events
* @method RendererConfig_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgWebRendererConfig1.prototype.RendererConfig_Changed = function (stateChangedFunction) {
    this.serviceProperties.RendererConfig.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readStringParameter(state)); 
    });
}


/**
* A service action to GetRendererConfig
* @method GetRendererConfig
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebRendererConfig1.prototype.GetRendererConfig = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetRendererConfig", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["RendererConfig"] = ohnet.soaprequest.readStringParameter(result["RendererConfig"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to SetRendererConfig
* @method SetRendererConfig
* @param {String} RendererConfig An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebRendererConfig1.prototype.SetRendererConfig = function(RendererConfig, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetRendererConfig", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("RendererConfig", RendererConfig);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}



