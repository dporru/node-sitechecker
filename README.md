# Node Site Checker

A node script for checking the state of a list of websites and sending an email or jabber/xmpp message if one or multiple websites are unreachable.

## Use

Clone or download this repository and execute npm install:

```bash
$ npm install
```
### Example

An example of how to use the script:

```javascript
var siteChecker = require('./sitechecker');

// make a list of websites to check
var sitesToCheck = [
	'http://www.example.com/',
	'http://www.example.com/test/',
	'http://www.example.com:8080/'
];

// configure jabber/xmpp notification
var jabberMessage = new siteChecker.JabberMessage()
	.fromJid('sitechecker@yourjabberserver.com', 'yourpassword')
	.toJid('notifyme@yourjabberserver.com');

// configure email notification
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

// do the actual checks and notification sending
siteChecker.check(sitesToCheck)
	.then(jabberMessage.send)
	.then(emailMessage.send)
	.then(function(result){
		if (result.sitesOffline.length !== 0){
			console.log(siteChecker.createMessage(result.sitesOffline));
		}
	})
	.done(function(){process.exit()});
```

### Notifications

The notifications are optional. You can also just return a list of the websites that are offline:

```javascript
var siteChecker = require('./sitechecker');

// make a list of websites to check
var sitesToCheck = [
	'http://www.example.com/',
	'http://www.example.com/test/',
	'http://www.example.com:8080'
];

// do the actual checks and notification sending
siteChecker.check(sitesToCheck)
	.then(function(result){
		if (result.sitesOffline.length !== 0){
			console.log(siteChecker.createMessage(result.sitesOffline));
		}
		process.exit()
	});
```

If you want to send another message than the default one, overwrite the siteChecker.createMessage() function:

```javascript
siteChecker.createMessage = function(sitesOffline){
	var message = "These sites did not respond or responded with errors:\n\n";
	
	for (var i=0, j=sites.length; i < j; i++){
		message += " - " + sites[i].url;
		message += " (statuscode: " + sites[i].statusCode + ")\n";
	}
	
	return message;
}
```

The notifications are only send when there are websites offline.

The jabber/xmpp notifications are done with node-xmpp. The email notifications are done with node-mailer.

If you ommit the .smtpTransportConfig() option for emailMessage, the mail() function of node-mailer is used. If you ommit the .subject() option, the default one is used, which is identical to the example.

### Request timeout

The request timeouts for servers that are not responding is default set to 5 seconds. Set it manually like so:

```javascript
// set a to seconds timeout for unreachable servers
siteChecker.setRequestTimeout(2000);
```

### CRON

If you want your sites periodically checked, create a cron-job for it:

```
# check if sites are still online every 5 minutes
*/5 * * * * /usr/bin/node /path/to/your/script.js
```