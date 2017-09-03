 

/**
* Service Proxy for CpProxyAvOpenhomeOrgWebClockConfig1
* @module ohnet
* @class WebClockConfig
*/
    
var CpProxyAvOpenhomeOrgWebClockConfig1 = function(udn){ 

    this.url = window.location.protocol + "//" + window.location.host + "/" + udn + "/av.openhome.org-WebClockConfig-1/control";  // upnp control url
    this.domain = "av-openhome-org";
    this.type = "WebClockConfig";
    this.version = "1";
    this.serviceName = "av.openhome.org-WebClockConfig-1";
    this.subscriptionId = "";  // Subscription identifier unique to each Subscription Manager 
    this.udn = udn;   // device name
    
    // Collection of service properties
    this.serviceProperties = {};
    this.serviceProperties["Alive"] = new ohnet.serviceproperty("Alive","bool");
    this.serviceProperties["ClockConfig"] = new ohnet.serviceproperty("ClockConfig","string");

                
}



/**
* Subscribes the service to the subscription manager to listen for property change events
* @method Subscribe
* @param {Function} serviceAddedFunction The function that executes once the subscription is successful
*/
CpProxyAvOpenhomeOrgWebClockConfig1.prototype.subscribe = function (serviceAddedFunction) {
    ohnet.subscriptionmanager.addService(this,serviceAddedFunction);
}


/**
* Unsubscribes the service from the subscription manager to stop listening for property change events
* @method Unsubscribe
*/
CpProxyAvOpenhomeOrgWebClockConfig1.prototype.unsubscribe = function () {
    ohnet.subscriptionmanager.removeService(this.subscriptionId);
}


    

/**
* Adds a listener to handle "Alive" property change events
* @method Alive_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgWebClockConfig1.prototype.Alive_Changed = function (stateChangedFunction) {
    this.serviceProperties.Alive.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readBoolParameter(state)); 
    });
}
    

/**
* Adds a listener to handle "ClockConfig" property change events
* @method ClockConfig_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgWebClockConfig1.prototype.ClockConfig_Changed = function (stateChangedFunction) {
    this.serviceProperties.ClockConfig.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readStringParameter(state)); 
    });
}


/**
* A service action to GetClockConfig
* @method GetClockConfig
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebClockConfig1.prototype.GetClockConfig = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetClockConfig", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["ClockConfig"] = ohnet.soaprequest.readStringParameter(result["ClockConfig"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to SetClockConfig
* @method SetClockConfig
* @param {String} ClockConfig An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgWebClockConfig1.prototype.SetClockConfig = function(ClockConfig, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetClockConfig", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("ClockConfig", ClockConfig);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}



