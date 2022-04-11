const config = require('./config')

const dialogflow = require ('dialogflow')
const bodyParser = require('body-parser')
const request = require('request')
const uuid = require('uuid')
const express = require('express')
const app = express()

if (!config.FB_APP_SECRET){
    throw new Error('missing FB_APP_SECRET');
}

if (!config.FB_PAGE_TOKEN){
    throw new Error ('missing FB_PAGE_TOKEN');
}

if (!config.FB_VERIFY_TOKEN){
    throw new Error ('missing FB_VERIFY_TOKEN');
}

if (!config.SERVER_URL){
    throw new Error ('missing SERVER_URL ');
}

if (!config.GOOGLE_CLIENT_EMAIL) {
    throw new Error ('missing GOOGLE_CLIENT_EMAIL');
}

if (!config.GOOGLE_PRIVATE_KEY) {
    throw new Error ('missing GOOGLE_PRIVATE_KEY');
}

if (!config.GOOGLE_PROJECT_ID) {
    throw new Error ('missing GOOGLE_PROJECT_ID');
    }
if (!config.LANGUAGE){
    throw new Error ('missing LANGUAGE');
}
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// Process application/json
app.use(bodyParser.json());

app.listen(5000)

//app.set('port',(process.env.PORT || 5000));



app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})



app.get('/webhook', function(req, res){
    console.log("FB Verification Request");
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }

})

app.post('/webhook/', function (req, res) {
    var data = req.body;
    console.log(JSON.stringify(data));



    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function (pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function (messagingEvent) {
                if (messagingEvent.optin) { 
                    receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        // You must send back a 200, within 20 seconds
        res.sendStatus(200);
    }
});