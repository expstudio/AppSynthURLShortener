var https = require('https');
var _ = require('underscore');

exports.send = function (arrOfTokens, notification) {
    // Define relevant info
    // var jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwOWY5MGFlMi1lM2YzLTQ2NTUtYTMyOC1hYzhjMDFkMDcwM2IifQ.GC7bZGUGeAdBhOiBVFu0Zy4t_dHpPjxlWjxNb2bFXFg';
    // var IonicApiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjOGRhMTJmYy01ZGU2LTQzMDAtODc1Yy0zZTE1ZGU4MTU4Y2QifQ.n4JFDmtmeUu0I02aF2dyDcnwnkfZ-osNePoKuauuHek";
    // var IonicApiToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJjOGRhMTJmYy01ZGU2LTQzMDAtODc1Yy0zZTE1ZGU4MTU4Y2QifQ.kGl7-HeTuWrMdjAHErfnToprFjErjGxoE9R2XwLZxWo";
    var IonicApiToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJjYzMyYjllNi1kZmU0LTRmNTctYjFhOS0wMmFmMGU3ZDkwZTUifQ.O6F9rYcmJjj5D39ZS3TDOidE8hRUYl2gmlWj2tyIasQ";
    var tokens = arrOfTokens;
    var profile = 'tinyappproduction';
    // var profile = 'tinyapp_development';
    tokens = _.filter(tokens, function(item){
      return item != null && item != "";
    });

    notification.ios = {
      "message": notification.message,
      "sound": "default",
      "badge": notification.badge,
    };

    notification.android = {
      "message": notification.message,
      "sound": "default",
      "badge": notification.badge,
    };

    // Build the request object
    var postData = JSON.stringify({
      "tokens": tokens,
      "profile": profile,
      "notification": notification
    });
    var req = {
      method: 'POST',
      protocol: 'https:',
      host: 'api.ionic.io',
      path: '/push/notifications',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + IonicApiToken
      }
    };

    // Make the API call
    var request = https.request(req, function(response){
      var str = ''
        response.on('data', function (chunk) {
          str += chunk;
        });

        response.on('end', function () {
          console.log(str);
        });
    });
    request.on('error', function (error) {
      console.log('problem sending notification', error);
    });

    request.write(postData);
    request.end();
}