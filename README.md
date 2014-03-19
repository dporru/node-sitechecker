# Node Site Checker

A node script for checking the state of a list of websites and sending an email or jabber/xmpp message if one or multiple websites are unreachable or returning error codes.

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

The notifications are only sent when there are websites offline.

The jabber/xmpp notifications are sent with node-xmpp. The email notifications are sent with node-mailer.

If you ommit the emailMessage.smtpTransportConfig() setting, the mail() function of node-mailer is used. If you ommit the emailMessage.subject() option, the default subject one is used.

If for some reason you don't want you're notifications to wait for each other, you can use the folliwing code. You need the [Q-library](https://github.com/kriskowal/q) for this.
```javascript
var Q = require("q");

// you're configuration code

siteChecker.check(sitesToCheck)
	.then(function(result){
		Q.allSettled([
			jabberMessage.send(result),
			emailMessage.send(result)
		]).then(function(){
			process.exit();
		});
	});
```

### Request timeout

The request timeouts for servers that are not responding is by default set to 20 seconds. Set it manually like so:

```javascript
// set a two seconds timeout for unreachable servers
siteChecker.setRequestTimeout(5000);
```

### CRON

If you want your sites periodically checked, create a cron-job for it:

```
# check if sites are still online every 5 minutes
*/5 * * * * /usr/bin/node /path/to/your/script.js
```