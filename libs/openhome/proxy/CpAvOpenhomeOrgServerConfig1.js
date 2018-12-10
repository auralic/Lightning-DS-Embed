 

/**
* Service Proxy for CpProxyAvOpenhomeOrgServerConfig1
* @module ohnet
* @class ServerConfig
*/
    
var CpProxyAvOpenhomeOrgServerConfig1 = function(udn, host){ 

    this.url = window.location.protocol + "//" +  host + "/" + udn + "/av.openhome.org-ServerConfig-1/control";  // upnp control url
    this.domain = "av-openhome-org";
    this.type = "ServerConfig";
    this.version = "1";
    this.serviceName = "av.openhome.org-ServerConfig-1";
    this.subscriptionId = "";  // Subscription identifier unique to each Subscription Manager 
    this.udn = udn;   // device name
    
    // Collection of service properties
    this.serviceProperties = {};
    this.serviceProperties["Alive"] = new ohnet.serviceproperty("Alive","bool");
    this.serviceProperties["SubscriptValue"] = new ohnet.serviceproperty("SubscriptValue","string");

                
}



/**
* Subscribes the service to the subscription manager to listen for property change events
* @method Subscribe
* @param {Function} serviceAddedFunction The function that executes once the subscription is successful
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.subscribe = function (serviceAddedFunction) {
    ohnet.subscriptionmanager.addService(this,serviceAddedFunction);
}


/**
* Unsubscribes the service from the subscription manager to stop listening for property change events
* @method Unsubscribe
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.unsubscribe = function () {
    ohnet.subscriptionmanager.removeService(this.subscriptionId);
}


    

/**
* Adds a listener to handle "Alive" property change events
* @method Alive_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.Alive_Changed = function (stateChangedFunction) {
    this.serviceProperties.Alive.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readBoolParameter(state)); 
    });
}
    

/**
* Adds a listener to handle "SubscriptValue" property change events
* @method SubscriptValue_Changed
* @param {Function} stateChangedFunction The handler for state changes
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.SubscriptValue_Changed = function (stateChangedFunction) {
    this.serviceProperties.SubscriptValue.addListener(function (state) 
    { 
        stateChangedFunction(ohnet.soaprequest.readStringParameter(state)); 
    });
}


/**
* A service action to SetServerName
* @method SetServerName
* @param {String} ServerName An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.SetServerName = function(ServerName, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetServerName", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("ServerName", ServerName);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetServerVersion
* @method GetServerVersion
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetServerVersion = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetServerVersion", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["ServerVersion"] = ohnet.soaprequest.readStringParameter(result["ServerVersion"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetProgressInfo
* @method GetProgressInfo
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetProgressInfo = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetProgressInfo", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["Progress"] = ohnet.soaprequest.readStringParameter(result["Progress"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetScanVersion
* @method GetScanVersion
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetScanVersion = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetScanVersion", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["ScanVersion"] = ohnet.soaprequest.readStringParameter(result["ScanVersion"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetWorkMode
* @method GetWorkMode
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetWorkMode = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetWorkMode", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["WorkMode"] = ohnet.soaprequest.readStringParameter(result["WorkMode"]); 
        result["WorkModeList"] = ohnet.soaprequest.readStringParameter(result["WorkModeList"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to SetWorkMode
* @method SetWorkMode
* @param {String} WorkMode An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.SetWorkMode = function(WorkMode, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetWorkMode", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("WorkMode", WorkMode);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to DelAllLocalDB
* @method DelAllLocalDB
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.DelAllLocalDB = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("DelAllLocalDB", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to InitHDD
* @method InitHDD
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.InitHDD = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("InitHDD", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to Rescan
* @method Rescan
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.Rescan = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("Rescan", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to HandMount
* @method HandMount
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.HandMount = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("HandMount", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to HandUMount
* @method HandUMount
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.HandUMount = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("HandUMount", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetDiskInfo
* @method GetDiskInfo
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetDiskInfo = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetDiskInfo", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["IsConnected"] = ohnet.soaprequest.readBoolParameter(result["IsConnected"]); 
        result["StatusCode"] = ohnet.soaprequest.readStringParameter(result["StatusCode"]); 
        result["StatusInfo"] = ohnet.soaprequest.readStringParameter(result["StatusInfo"]); 
        result["Capacity"] = ohnet.soaprequest.readStringParameter(result["Capacity"]); 
        result["FileCount"] = ohnet.soaprequest.readStringParameter(result["FileCount"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetSMBConfig
* @method GetSMBConfig
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetSMBConfig = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetSMBConfig", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["SMBAddr"] = ohnet.soaprequest.readStringParameter(result["SMBAddr"]); 
        result["SMBUserName"] = ohnet.soaprequest.readStringParameter(result["SMBUserName"]); 
        result["SMBPassWord"] = ohnet.soaprequest.readStringParameter(result["SMBPassWord"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to SetSMBConfig
* @method SetSMBConfig
* @param {String} SMBAddr An action parameter
* @param {String} SMBUserName An action parameter
* @param {String} SMBPassWord An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.SetSMBConfig = function(SMBAddr, SMBUserName, SMBPassWord, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetSMBConfig", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("SMBAddr", SMBAddr);
    request.writeStringParameter("SMBUserName", SMBUserName);
    request.writeStringParameter("SMBPassWord", SMBPassWord);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetDriveMountResult
* @method GetDriveMountResult
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetDriveMountResult = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetDriveMountResult", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["DriveMountResult"] = ohnet.soaprequest.readBoolParameter(result["DriveMountResult"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to EditTrack
* @method EditTrack
* @param {String} EditValue An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.EditTrack = function(EditValue, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("EditTrack", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("EditValue", EditValue);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to ScanVersionDiff
* @method ScanVersionDiff
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.ScanVersionDiff = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("ScanVersionDiff", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["ScanVersionDiffValue"] = ohnet.soaprequest.readStringParameter(result["ScanVersionDiffValue"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetInitHDDResult
* @method GetInitHDDResult
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetInitHDDResult = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetInitHDDResult", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["InitHDDResult"] = ohnet.soaprequest.readBoolParameter(result["InitHDDResult"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetHDDHasInited
* @method GetHDDHasInited
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetHDDHasInited = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetHDDHasInited", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["HDDHasInited"] = ohnet.soaprequest.readBoolParameter(result["HDDHasInited"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to USBImport
* @method USBImport
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.USBImport = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("USBImport", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetDISKCapacity
* @method GetDISKCapacity
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetDISKCapacity = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetDISKCapacity", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["DISKTotal"] = ohnet.soaprequest.readStringParameter(result["DISKTotal"]); 
        result["DISKUsed"] = ohnet.soaprequest.readStringParameter(result["DISKUsed"]); 
        result["DISKAvailable"] = ohnet.soaprequest.readStringParameter(result["DISKAvailable"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to ForceRescan
* @method ForceRescan
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.ForceRescan = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("ForceRescan", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetCurrentScanFile
* @method GetCurrentScanFile
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetCurrentScanFile = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetCurrentScanFile", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["ScanFile"] = ohnet.soaprequest.readStringParameter(result["ScanFile"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to GetServerConfig
* @method GetServerConfig
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.GetServerConfig = function(successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("GetServerConfig", this.url, this.domain, this.type, this.version);     
    request.send(function(result){
        result["GetValue"] = ohnet.soaprequest.readStringParameter(result["GetValue"]); 
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}


/**
* A service action to SetServerConfig
* @method SetServerConfig
* @param {String} SetValue An action parameter
* @param {Function} successFunction The function that is executed when the action has completed successfully
* @param {Function} errorFunction The function that is executed when the action has cause an error
*/
CpProxyAvOpenhomeOrgServerConfig1.prototype.SetServerConfig = function(SetValue, successFunction, errorFunction){ 
    var request = new ohnet.soaprequest("SetServerConfig", this.url, this.domain, this.type, this.version);     
    request.writeStringParameter("SetValue", SetValue);
    request.send(function(result){
    
        if (successFunction){
            successFunction(result);
        }
    }, function(message, transport) {
        if (errorFunction) {errorFunction(message, transport);}
    });
}



