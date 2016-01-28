var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

exports.send = function(senderEmail, password, mailConfig) {
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: password
        }
        /*host: 'localhost',
        port: 25,
        auth: {
            user: 'gmail.user@gmail.com',
            pass: 'userpass'
        }*/
    }));

    var mailOptions = mailConfig;

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}
    