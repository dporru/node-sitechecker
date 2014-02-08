"use strict"

var siteChecker = require('./sitechecker');

// Make a list of websites to check.
var sitesToCheck = [
	'http://www.example.com/',
	'http://www.example.com/test/',
	'http://www.example.com:8080/'
];

// Configure jabber/xmpp notification.
var jabberMessage = new siteChecker.JabberMessage()
	.fromJid('sitechecker@yourjabberserver.com', 'yourpassword')
	.toJid('notifyme@yourjabberserver.com');

// Configure email notification.
var emailMessage = new siteChecker.EmailMessage()
	.smtpTransportConfig({
		service: "Gmail",
		auth: {
			user: "youraccount@gmail.com",
			pass: "yourpassword"
		}
	})
	.fromAddress('youraccount@gmail.com')
	.toAddress('notifyme@gmail.com')
	.subject('Notification of offline websites');

// Do the actual checks and notification sending.
siteChecker.check(sitesToCheck)
	.then(jabberMessage.send)
	.then(emailMessage.send)
	.then(function(result){
		if (result.sitesOffline.length !== 0){
			console.log(siteChecker.createMessage(result.sitesOffline));
		}
	})
	.done(function(){process.exit()});