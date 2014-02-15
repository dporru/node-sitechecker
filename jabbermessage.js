"use strict"

// Load the required modules
var Q = require("q"),
Client = require('node-xmpp-client'),
ltx  = require('ltx');

/**
 * Main function to expose as the module itself.
 */
module.exports = function(){
	var fromJid, fromJidPassword, toJid, self = this;
	
	/**
	 * Set jabber/xmpp id that should send the notification.
	 * 
	 * @param string jid jabber/xmpp id
	 * @param string password Password for the jid
	 *
	 * @return object Main class object (self)
	 */
	self.fromJid = function(jid, password){
		fromJid = jid;
		fromJidPassword = password;
		
		return self;
	};
	
	/**
	 * Set jabber/xmpp id that should receive the notification.
	 * 
	 * @param string jid jabber/xmpp id
	 *
	 * @return object Main class object (self)
	 */
	self.toJid = function(jid){
		toJid = jid;
		
		return self;
	};
	
	/**
	 * Send the jabber/xmpp notification. A notification will only be sent if the list
	 * of offline sites is not empty.
	 * 
	 * @param object result Containing an sitesOffline and message key.
	 *
	 * @return object promise
	 */
	self.send = function(result){
		var deferred = Q.defer();
		
		if (!fromJid || !fromJidPassword){
			deferred.reject(new Error('fromJid not set, this is required!'));
			return deferred.promise;
		}
		
		if (!toJid){
			deferred.reject(new Error('toJid not set, this is required!'));
			return deferred.promise;
		}
		
		if (!result){
			deferred.reject(new Error('No result object received, is your promise chain correct?'));
			return deferred.promise;
		}
		
		if (!result.sitesOffline){
			deferred.reject(new Error('No list of offline sites received, is your promise chain correct?'));
			return deferred.promise;
		}
		
		if (!result.message){
			deferred.reject(new Error('No offline message received, is your promise chain correct?'));
			return deferred.promise;
		}
		
		if (result.sitesOffline.length !== 0){
			var client = new Client({
				jid: fromJid,
				password: fromJidPassword
			});
			
			client.addListener('online', function(data) {
				var stanza = new ltx.Element(
					'message',
					{ to: toJid, type: 'chat' }
				).c('body').t(result.message);
				
				client.send(stanza);
				client.end()
				
				deferred.resolve(result);
			});
			
			client.addListener('error', function(error){
				deferred.reject(error);
			});
			
		}else{
			deferred.resolve(result);
		}
		
		return deferred.promise;
	};
}