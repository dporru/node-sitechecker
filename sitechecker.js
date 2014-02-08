"use strict"

// Load required modules.
var http = require('http'),
	_ = require('underscore'),
	url = require('url'),
	Q = require("q"),
	requestTimeout = 5000;

// Load the jabbermessage and emailmessage modules
// and make them available through this module.
module.exports.JabberMessage = require('./jabbermessage');
module.exports.EmailMessage = require('./emailmessage');

/**
 * Set the request timeout for unreachable servers manually.
 * 
 * @param integer timout The request timeout in miliseconds.
 */
module.exports.setRequestTimeout = function(timeout){
	requestTimeout = timeout;
};

/**
 * Make the actual requests and log the ones that don't respond or respond with
 * an error.
 * 
 * @param array siteUrls List of urls to check.
 * 
 * @return object promise
 */
module.exports.check = function(siteUrls){
	var requestDoneNumber = 0,
		sitesOffline = [],
		deferred = Q.defer();
	
	// Go over the list of urls and make the requests
	_.each(siteUrls, function(siteUrl){
		var request = http.get(url.parse(siteUrl), function(response){
			if (response.statusCode >= 400){
				siteOffline(siteUrl, response.statusCode);
			}
			requestDone();
		});
		request.on('error', function(error){
			if (error.code === 'ECONNRESET'){
				siteOffline(siteUrl, 'UNREACHABLE');
			}else{
				siteOffline(siteUrl, 'PORT CLOSED');
			}
			requestDone();
		});
		request.setTimeout(requestTimeout);
		request.on('timeout', function(){
			request.abort();
		});
	});
	
	/**
	 * Log a site as being offline
	 * 
	 * @param string siteUrl The url to the site.
	 * @param mixed statusCode The status code of the request or the error.
	 */
	var siteOffline = function(siteUrl, statusCode){
		sitesOffline.push({url: siteUrl, statusCode: statusCode});
	}
	
	/**
	 * Log a request as completed.
	 * Once all requests are complete, resolve the promise.
	 */
	var requestDone = function(){
		requestDoneNumber++;
		if (siteUrls.length === requestDoneNumber){
			deferred.resolve({sitesOffline: sitesOffline, message: module.exports.createMessage(sitesOffline)});
		}
	};
	
	return deferred.promise;
}

/**
 * Create a message based on a list of offline sites
 * 
 * @param array sites List of sites that are offline containing an object {url: <url>, statusCode: <statusCode>}
 * 
 * @return string Message
 */
module.exports.createMessage = function(sites){
	var message = "These sites did not respond or responded with errors:\n\n";
	
	for (var i=0, j=sites.length; i < j; i++){
		message += " - " + sites[i].url;
		message += " (status code: " + sites[i].statusCode + ")\n";
	}
	
	return message;
}