"use strict"

// Load te required modules
var Q = require("q"),
	nodemailer = require("nodemailer");

/**
 * Main function to expose as the module itself.
 */
module.exports = function(){
	var smtpTransport,
		toAddress,
		fromAddress,
		subject,
		self = this;
	
	/**
	 * Set the config object for the smtpTransport object to
	 * be used to send the email.
	 * This function can be ommitted, the default nodemail.mail()
	 * function is then used.
	 * 
	 * @param object transportConfig
	 *
	 * @return object Main class object (self)
	 */
	self.smtpTransportConfig = function(transportConfig){
		smtpTransport = nodemailer.createTransport("SMTP", transportConfig);
		
		return self;
	};
	
	/**
	 * Set email address to should receive the notification.
	 * 
	 * @param string email Email address
	 *
	 * @return object Main class object (self)
	 */
	self.toAddress = function(email){
		toAddress = email;
		
		return self;
	};
	
	/**
	 * Set email address that is used as from in the header.
	 * 
	 * @param string email Email address
	 *
	 * @return object Main class object (self)
	 */
	self.fromAddress = function(email){
		fromAddress = email;
		
		return self;
	};
	
	/**
	 * Set the subject of the notification email.
	 * This can be ommitted, a default subject will be used.
	 * 
	 * @param string subj Subject line
	 *
	 * @return object Main class object (self)
	 */
	self.subject = function(subj){
		subject = subj;
		
		return self;
	};
	
	/**
	 * Send the email notification. A notification will only be sent if the list
	 * of offline sites is not empty.
	 * 
	 * @param object result Containing an sitesOffline and message key.
	 *
	 * @return object promise
	 */
	self.send = function(result){
		var deferred = Q.defer();
		
		if (!fromAddress){
			deferred.reject(new Error('fromAddress not set, this is required!'));
			return deferred.promise;
		}
		
		if (!toAddress){
			deferred.reject(new Error('toAddress not set, this is required!'));
			return deferred.promise;
		}
		
		if (!subject){
			subject = 'Notification of offline websites'
		}
		
		if (result.sitesOffline.length !== 0){
			var mailOptions = {
				from: fromAddress,
				to: toAddress,
				subject: subject,
				text: result.message,
			};
			
			if (!smtpTransport){
				nodemailer.mail(mailOptions);
				deferred.resolve(result);
			}else{
				smtpTransport.sendMail(mailOptions, function(error, response){
					if (smtpTransport){
						smtpTransport.close();
					}
					if(error === null){
						deferred.resolve(result);
					}else{
						deferred.reject(new Error(error));
					}
				});
			}
			
		}else{
			deferred.resolve(result);
		}
		
		return deferred.promise;
	};
}