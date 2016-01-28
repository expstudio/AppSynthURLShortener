var sendgrid  = require('sendgrid')('panphu', 'letshavefun#1');
sendgrid.send({
    to:       'anphu.1225@gmail.com',
    from:     'anphu@tinyapp.com',
    subject:  'Hello World',
    text:     'My first email through SendGrid.'
}, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
});