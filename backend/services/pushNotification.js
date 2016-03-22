var https = require('https');
exports.send = function (arrOfTokens, notification) {
    // Define relevant info
    var jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwOWY5MGFlMi1lM2YzLTQ2NTUtYTMyOC1hYzhjMDFkMDcwM2IifQ.GC7bZGUGeAdBhOiBVFu0Zy4t_dHpPjxlWjxNb2bFXFg';
    var tokens = arrOfTokens;
    var profile = 'tiny_security_profile';

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
        'Authorization': 'Bearer ' + jwt
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