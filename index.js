var https = require('https'),
    twilio = require('twilio'),
    config = require('./config.json'),
    numbers = require('./numbers.json'),
    client = new twilio.RestClient(config.id, config.token);

// Check every 5 minutes
var checkDelay = 60000 * 5;

// Store the previous response body for comparison
var lastBody = null;

var sendTexts = function()
{
  var url = 'https://drafthouse.com/starwars/austin',
      message = 'Star Wars tickets available. Go! ' + url;

  numbers.forEach(function(number){
    client.sms.messages.create({
      to: number,
      from: config.number,
      body: message
    }, function(error, message) {
      if (!error) {
        // The second argument to the callback will contain the information
        // sent back by Twilio for the request. In this case, it is the
        // information about the text messsage you just sent:
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);
 
        console.log(number +' Message sent on:');
        console.log(message.dateCreated);
      }
      else {
        console.log('Oops! There was an error. ' + number);
      }  
    });
  });
}

var checkTickets = function()
{
  // Start check...
  https.get({
    protocol: 'https:',
    host: 'drafthouse.com',
    path: '/ajax/.showtimes-show-starwars/0000/A000010000%7CA000009999',
    headers: {
      'cache-control': 'max-age=0'
    }
  }, function(response) {
    // console.log(response.body);
    response.on('data', function(chunk) {
      var body = chunk.toString(),
          url = 'https://drafthouse.com/starwars/austin';
      if (body !== lastBody && lastBody !== null) {
        // OMG THEY'RE READY, GOGOGOGO
        sendTexts();
        return;
      }
      
      // NOPE, NO TICKETS YET
      console.log('No tickets yet :(');

      // Check again in checkDelay milliseconds
      setTimeout(function() {
        checkTickets();
      }, checkDelay)

      lastBody = body;
    });
  });
};

checkTickets();