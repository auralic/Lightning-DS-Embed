 

/**
* Service Proxy for CpProxyAvOpenhomeOrgWebProcessorConfig1
* @module ohnet
* @class WebProcessorConfig
*/
    
var CpProxyAvOpenhomeOrgWebProcessorConfig1 = function(udn, host){ 

    this.url = window.location.protocol + "//" + host + "/" + udn + "/av.openhome.org-WebProcessorConfig-1/control";  // upnp control url
    this.domain = "av-openhome-org";
    this.type = "WebProcessorConfig";
    this.version = "1";
    this.serviceName = "av.openhome.org-WebProcessorConfig-1";
    this.subscriptionId = "";  // Subscription identifier unique to each Subscription Manager 
    this.udn = udn;   // device name
    
    // Collection of service properties
    this.serviceProperties = {};
    this.serviceProperties["ProcessorConfig"] = new ohnet.serviceproperty("ProcessorConfig","string");

          
}



/**
* Subscribes the service to the subscription manager to listen for property change events
* @method Subscribe
* @param {Function} serviceAddedFunction The function that executes once the subscription is successful
*/
CpProxyAvOpenhomeOrgWebProcessorConfig1.prototype.subscribe = function (serviceAddedFunction) {
    ohnet.subscriptionmanager.addService(this,serviceAddedFunction);
}


/**
* Unsubscribes the service from the subscription manager to stop listening for property change events
* @method Unsubscribe
*/
CpProxyAvOpenhomeOrgWebProcessorConfig1.prototype.unsubscribe = function () {
    ohnet.subscriptionmanager.removeService(this.subscriptionId);
}


    

/**
* Adds a listener to handle "ProcessorConfig" property change events
* @method ProcessorConfig_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgWebProcessorConfig1.prototype.ProcessorConfig_Changed = function (stateChangedFunction) {
    this.serviceProperties.ProcessorConfig.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readStringParameter(state)); 
    });
}


/**
* A service action to GetProcessorConfig
* @method GetProcessorConfig
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebProcessorConfig1.prototype.GetProcessorConfig = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetProcessorConfig", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["ProcessorConfig"] = ohnet.soaprequest.readStringParameter(result["ProcessorConfig"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to SetProcessorConfig
* @method SetProcessorConfig
* @param {String} ProcessorConfig An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebProcessorConfig1.prototype.SetProcessorConfig = function(ProcessorConfig, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetProcessorConfig", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("ProcessorConfig", ProcessorConfig);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}



