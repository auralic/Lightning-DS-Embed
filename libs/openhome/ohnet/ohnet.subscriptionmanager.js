﻿/**
 * The ohnet object is the single global object used by ohnet Services to
 * facilitate actions and subscriptions.
 * @module ohnet
 * @title ohnet
 */

if( typeof ohnet == "undefined" || !ohnet) {
	/**
	 * The ohnet global namespace object.  If ohnet is already defined, the
	 * existing ohnet object will not be overwritten so that defined
	 * namespaces are preserved.
	 * @class ohnet
	 * @static
	 */
	var ohnet = {};
}

/**
 * Manages the subscriptions to the ohnet Services.
 * Subscribed services are notified of property state changes.
 * @namespace ohnet
 * @class SubscriptionManager
 * @static
 */
ohnet.subscriptionmanager = (function() {

	// Constants
	var DEFAULT_SUBSCRIPTION_TIMEOUT_SEC = 1800;
	var WEBSOCKETRETRYATTEMPTS = 1;
	// The number if retries for websockets before falling back to long polling (does not include initial attempt).
	var RENEW_TRIGGER = 0.7;
	// The multiplier in which to send the renewal message. (Send renew message every RENEW_TRIGGER * DEFAULT_SUBSCRIPTION_TIMEOUT_SEC)

	// Private Variables
	var Debug = false;
	// A flag to enable debugging messages written to console
	var subscriptionTimeoutSeconds = -1;
	// The suggested timeout in seconds for each subscription.
	var clientId = '';
	// A flag to force the subscription manager to always use long polling
	var StartedFunction, ErrorFunction, DisconnectedFunction, webSocketPort, webSocketLive = false, webSocketAttempts = 0, webSocketOpened = false, ws, lp;
	var services = {}, pendingServices = [], pendingPropertyUpdates = {};
	var options = {};
	// Public Variables
	var running = false;
	// 当前订阅的设备udn
	var udn = '';
	// 当前订阅的 url
	var host = '';
	// A flag to state if the Subscription Manager is running

	// Functions

	/**
	 * Starts the timer to renew subscriptions.
	 * The actual subscription timeout is returned by the ohnet Service.
	 * subscriptionTimeoutSeconds is the suggested timeout sent to the server.
	 * @method setSubscriptionTimeout
	 * @param {Int} subscriptionId The subscription id of the service
	 * @param {Int} timeoutSeconds The actual subscription timeout
	 */
	var setSubscriptionTimeout = function(subscriptionId, timeoutSeconds) {
		var service = services[subscriptionId];
		if(service) {
			var actualSubscriptionTimeoutMs = timeoutSeconds * 1000 * RENEW_TRIGGER;
			var timer = setTimeout(function() {
				renewSubscription(subscriptionId);
			}, actualSubscriptionTimeoutMs);

			service.SubscriptionTimer = timer;
			// Keep a reference to the timer so we can clear it when the service unsubscribes

			if(Debug) {
				console.log("setSubscriptionTimeout/actualSubscriptionTimeoutMs:" + actualSubscriptionTimeoutMs);
			}
		}
	};
	/**
	 * Calls SetValue of the property
	 * @method setPropertyUpdate
	 * @param {Int} subscriptionId The subscription id of the service
	 * @param {String} propertyName The property name to update
	 * @param {String} propertyValue The new value of the property
	 */
	var setPropertyUpdate = function(subscriptionId, propertyName, propertyValue) {
		var service = services[subscriptionId];
		if(service) {
			var property = service.serviceProperties[propertyName];
			if(property) {
				property.setValue(propertyValue);
			}
		}
	};
	/**
	 * Remove the pending service and add it to the services with the
	 * subscription id generated from the node.
	 * @method receiveSubscribeCompleted
	 * @param {Int} subscriptionId The subscription id of the service
	 * @param {String} udn The udn name
	 * @param {String} service The Service name
	 * @param {Object} xmlDoc The XML to traverse
	 */
	var receiveSubscribeCompleted = function(subscriptionId, udn, service, timeout) {
		
		for(var i = 0; i < pendingServices.length; i++) {
			var pendingService = pendingServices[i];

			if(pendingService.udn == udn && pendingService.serviceName == service) {
				services[subscriptionId] = pendingService;
				services[subscriptionId].subscriptionId = subscriptionId;
				pendingServices.splice(i, 1);

				var service = services[subscriptionId];
				if(service.serviceAddedFunction) {
					service.serviceAddedFunction();
					service.serviceAddedFunction = null;
				}

				if(pendingPropertyUpdates[subscriptionId]) {
					receivePropertyUpdate(pendingPropertyUpdates[subscriptionId]);
					delete pendingPropertyUpdates[subscriptionId];
				}
			}
		}
		receiveRenewCompleted(subscriptionId, timeout);
	};
	/**
	 * Calls ReportChanged of the property to notify listeners
	 * @method setPropertyChanged
	 * @param {Int} subscriptionId The subscription id of the service
	 * @param {String} propertyName The property name to update
	 * @param {String} propertyValue The new value of the property
	 */
	var setPropertyChanged = function(subscriptionId, propertyName, propertyValue) {
		var service = services[subscriptionId];
		if(service) {
			var property = service.serviceProperties[propertyName];
			if(property) {
				property.reportChanged(propertyValue);
			}
		}
	};
	/**
	 * Sends a renew socket message to renew the subscription
	 * @method renewSubscription
	 * @param {Int} subscriptionId The subscription id of the service
	 */
	var renewSubscription = function(subscriptionId) {
		var service = services[subscriptionId];
		if(service && service.SubscriptionTimer) {(webSocketLive) ? ws.renew(subscriptionId) : lp.renew(subscriptionId);
		}
	};
	/**
	 * Starts the timer to renew subscriptions.
	 * The actual subscription timeout is returned by the ohnet Service.
	 * subscriptionTimeoutSeconds is the suggested timeout sent to the server.
	 * @method receiveRenewCompleted
	 * @param {Int} subscriptionId The subscription id of the service
	 * @param {Object} xmlDoc The XML to traverse
	 */
	var receiveRenewCompleted = function(subscriptionId, timeout) {
		if(Debug) {
			console.log("receiveRenewCompleted - subscriptionId:" + subscriptionId + ' timeout:' + timeout);
		}
		setSubscriptionTimeout(subscriptionId, timeout);

	};
	/**
	 * Traveres the XML object to extract the property updates
	 * @method receivePropertyUpdate
	 * @param {Int} subscriptionId The subscription id of the service
	 * @param {Object} xmlDoc The XML to traverse
	 */
	var receivePropertyUpdate = function(xmlDoc) {
		//var subscriptionNodes = xmlDoc.getElementsByTagNameNS("*", "SUBSCRIPTION");
		var subscriptionNodes = ohnet.util.getElementsByTagNameNS(xmlDoc, "SUBSCRIPTION");
		// NON-IE
		for(var i = 0; i < subscriptionNodes.length; i++) {
			var subscriptionId = ohnet.util.getElementText(ohnet.util.getElementsByTagNameNS(subscriptionNodes[i], "SID")[0]);
			//var subscriptionId = subscriptionNodes[i].getElementsByTagNameNS("*", "SID")[0].textContent;
			// NON-IE#
			if(!services[subscriptionId]) {
				pendingPropertyUpdates[subscriptionId] = xmlDoc;
				return;
			}

			//var properties = subscriptionNodes[i].getElementsByTagNameNS("*", "property");
			var properties = ohnet.util.getElementsByTagNameNS(subscriptionNodes[i],  "property");
			// NON-IE
			if(properties) {
				var _text;
				var _tagName;
				for(var j = 0; j < properties.length; j++) {
					var property = properties[j].childNodes[0];
					_text = ohnet.util.getElementText(property);
					_tagName = ohnet.util.getElementNodeName(property);
					if(property) {
						setPropertyUpdate(subscriptionId, _tagName, _text);
						if(Debug) {
							console.log("receivePropertyUpdate - subscriptionId: " + subscriptionId + " name: " + _tagName + " value: " + _text);
						}
					}
				}

				for(var p = 0; p < properties.length; p++) {
					var property = properties[p].childNodes[0];
					_text = ohnet.util.getElementText(property);
					_tagName = ohnet.util.getElementNodeName(property);
					if(property) {
						setPropertyChanged(subscriptionId, _tagName, _text);
					}
				}
			}
		}
	};
	/**
	 * Socket event for when an error occurs.  Debugging purposes only.
	 * @method onSocketError
	 */
	var onSocketError = function() {
		webSocketLive = false;
		console.log("onSocketError");
	};
	/**
	 * Socket event for when the socket is closed.
	 * @method onSocketClose
	 */
	var onSocketClose = function() {
		stop();
		webSocketLive = false;
		console.log("onSocketClose");
		
		if(webSocketOpened) {
			if(webSocketAttempts < WEBSOCKETRETRYATTEMPTS) {
				setTimeout(function() {
					webSocketAttempts++;
					startWebSocket("ws://" + window.location.hostname + ":" + options.port + "/");
				},1000);
			}
			else
			{
				if(DisconnectedFunction) {
					DisconnectedFunction();
				}
			}
		} else {
			startLongPolling();
		}
	};
	
	
	/**
	 * Long Poll event for when the node is no longer accepting long poll request.
	 * @method onLongPollClose
	 */
	var onLongPollClose = function() {
		console.log("onLongPollClose");
		stop();
		if(DisconnectedFunction) {
			DisconnectedFunction();
		}
	};
	
	
	/**
	 * Socket event for when the socket is opened.  Debugging purposes only.
	 * @method onSocketOpen
	 */
	var onSocketOpen = function() {
		webSocketLive = true;
		webSocketOpened = true;
		console.log("onSocketOpen");
		if(!running)
		{
			services = {};
			pendingServices = [];
			pendingPropertyUpdates = {};
			running = true;
			if(StartedFunction)
				StartedFunction();
			
		}
	};
	
	
	/**
	 * Starts the Subscription Manager and opens a Web Socket.
	 * @method start
	 * @param {Object} options Contains user defined options
	 */
	var start = function(opt, chost, cudn) {
		var defaults = {
			startedFunction : null,
			port : 54321,
			debugMode : false,
			subscriptionTimeoutSeconds : DEFAULT_SUBSCRIPTION_TIMEOUT_SEC,
			errorFunction : null,
			disconnectedFunction : null,
			allowWebSockets : true,
			retryInterval : 3000
		};
		options = ohnet.util.mergeOptions(defaults, opt);
		clientId = ohnet.util.generateGUID();
		StartedFunction = options.startedFunction;
		ErrorFunction = options.errorFunction;
		DisconnectedFunction = options.disconnectedFunction;
		Debug = options.debugMode;
		webSocketPort = options.port;
		RetryInterval = options.retryInterval;
		subscriptionTimeoutSeconds = options.subscriptionTimeoutSeconds;
		udn = cudn;
		host = chost;
		
		if(Debug) {
			console.log("*** ohnet.SubscriptionManager ***");
		}

		if(options.port && options.port != "") {
			//var websocketSupported = ("WebSocket" in window);
			// if(websocketSupported && options.allowWebSockets) {// NON-IE check if Websockets is supported
			// 	startWebSocket("ws://" + chost.substring(0, chost.indexOf(':')) + ':' + options.port + "/");
			// } else {
			 	startLongPolling();
			// }
		} else {
			if(Debug) {
				console.log("start/port: NULL");
			}

			if(options.errorFunction)
				options.errorFunction('Connection failed.');
		}
	};
	/**
	 * Start messaging via long polling
	 * @method startLongPolling
	 * @param {String} url The suggested subscription timeout value.  Overrides the default.
	 */
	var startLongPolling = function() {
		if(Debug) {
			console.log("start/startLongPolling");
		}
		lp = new ohnet.longpolling(clientId, udn, {
			debug : Debug,
			subscriptionTimeoutSeconds : DEFAULT_SUBSCRIPTION_TIMEOUT_SEC,
			onReceivePropertyUpdate : receivePropertyUpdate,
			onReceiveSubscribeCompleted : receiveSubscribeCompleted,
			onReceiveRenewCompleted : receiveRenewCompleted,
			onReceiveError : onLongPollClose
		},host);
		if(!running)
		{
			services = {};
			pendingServices = [];
			pendingPropertyUpdates = {};
			running = true;
			if(StartedFunction)
				StartedFunction();
		}
		
		
	};
	/**
	 * Start messaging via websocket
	 * @method startWebSocket
	 */
	var startWebSocket = function(url) {

		if(Debug) {
			console.log("start/startWebSocket: " + url);
		}
		ws = new ohnet.websocket(clientId, url, {
			debug : Debug,
			subscriptionTimeoutSeconds : DEFAULT_SUBSCRIPTION_TIMEOUT_SEC,
			onSocketError : onSocketError,
			onSocketClose : onSocketClose,
			onSocketOpen : onSocketOpen,
			onReceivePropertyUpdate : receivePropertyUpdate,
			onReceiveSubscribeCompleted : receiveSubscribeCompleted,
			onReceiveRenewCompleted : receiveRenewCompleted
		});

	};
	/**
	 * Stops the Subscription Manager and removes all services
	 * @method stop
	 */
	var stop = function() {
		for(var key in services) {
			if(services.hasOwnProperty(key)) {
				removeService(key);
			}
		}
		running = false;
		if(webSocketLive) {
			ws.close();
		}
	};
	/**
	 * Helper method to count services
	 * @method countServices
	 */
	var countServices = function() {
		var serviceCount = 0;
		for(var key in services) {
			console.log('had service is %o', key);
			if(services.hasOwnProperty(key)) {
				serviceCount++;
			}
		}
		return serviceCount;
	};
	/**
	 * Adds a new service to the Services collection and subscribes for property changes
	 * @method addService
	 * @param {Object} service The Service to be added
	 * @param {Function} serviceAddedFunction The function to call once the service has been successfully added
	 */
	var addService = function(service, serviceAddedFunction) {
		if(running) {
			pendingServices.push(service);

			if(serviceAddedFunction) {
				service.serviceAddedFunction = serviceAddedFunction;

			}(webSocketLive) ? ws.subscribe(service) : lp.subscribe(service, countServices() == 0);
		} else {
			if(Debug) {
				console.log("addService/running: false");
			}
			console.log("Subscription Manager is not running.  Please ensure 'ohnet.subscriptionmanager.start();' has been called prior to subscribing.");
		}
	};
	/**
	 * Removes a service from the Services collection and unsubscribes
	 * @method removeService
	 * @param {Int} subscriptionId The subscription id of the service
	 */
	var removeService = function(subscriptionId) {
		var service = services[subscriptionId];
		if(service) {
			delete services[subscriptionId]; 
			(webSocketLive) ? ws.unsubscribe(subscriptionId) : lp.unsubscribe(subscriptionId, countServices() == 0);

			if(service.SubscriptionTimer) {// Stop in-progress timers
				clearTimeout(service.SubscriptionTimer);
			}

		}
	};

	var clearService = function(){
		var service;
		for(var subscriptionId in services){
			removeService(subscriptionId);
		}
		
	};

	var restart = function(){
		if(lp){
			for(var subscriptionId in services){
				removeService(subscriptionId);
			}
		}
		lp = new ohnet.longpolling(clientId, udn, {
			debug : Debug,
			subscriptionTimeoutSeconds : DEFAULT_SUBSCRIPTION_TIMEOUT_SEC,
			onReceivePropertyUpdate : receivePropertyUpdate,
			onReceiveSubscribeCompleted : receiveSubscribeCompleted,
			onReceiveRenewCompleted : receiveRenewCompleted,
			onReceiveError : onLongPollClose
		},host);
	};

	var renew = function(success, fail){
		for(var subscriptionId in services){
			lp.renew(subscriptionId, success, fail);
		}
	};

	var isWebSocket = function() {
		return webSocketLive;
	};

	var getUdn = function(){
		return udn;
	};

	var getHost = function(){
		return host;
	};

	var isRunning = function(){
		return running && lp.isStarted();
	};

	var getLastReviceDate = function(){
		return lp && lp.getLastReviceDate();
	};
	var hasSubscribe = function(){
		return lp && lp.hasSubscribe();
	};

	return {
		// Public Variables
		isRunning : isRunning,

		// Public Methods
		start : start,
		stop : stop,
		restart : restart,
		addService : addService,
		removeService : removeService,
		clearService : clearService,
		getHost : getHost,
		getLastReviceDate : getLastReviceDate,
		getUdn : getUdn,
		renew : renew,
		hasSubscribe : hasSubscribe
	};
})();
