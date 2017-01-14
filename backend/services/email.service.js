var Promise = require('bluebird');
var sendgrid = require('sendgrid')('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');
var config = require('../env');
var i18n = require('i18n');


module.exports = {
  sendActivationEmail: sendActivationEmail,
  sendGroupCode: sendGroupCode,
  sendWelcome: sendWelcome
};

function sendActivationEmail(user) {

  var url = config.ROOT_URL + '/activate/' + user._id.toString() + '/' + user.verification.token;
  var notice = '';
  var lang = user.lang || 'fi';
  i18n.setLocale(lang);

  if (user.roles.indexOf('teacher') > -1) {
    notice = '<p>' + i18n.__("Please note that you will receive a separate email including your group code. With that group code parents are able to join to the group you just created.") + '</p>';
  }
  var body = '<h3>' + i18n.__("Welcome, {{name}}", {name: user.username}) + '</h3>'
  + '<h4>' + i18n.__("Welcome to the family of Tiny. Please click here to activate your account.") + '</h4>'
  + '<a href="' + url + '">' + url + '</a>'
  + notice;

  var email = new sendgrid.Email({
    from: 'tinyapp@noreply.fi',
    subject: i18n.__('Activate your TinyApp account'),
    html: body
  });

  if (user.roles.indexOf('teacher') > -1 && process.env.NODE_ENV === 'production') {
    email.addTo('hello@tinyapp.biz');
  } else {
    email.addTo(user.local.email); 
  }

  sendgrid.send(email, function (err, json) {
    if (err) {
      return console.error(err);
    }
    console.log('Activation Email sent to ', user.local.email);
  });
  
  return Promise.resolve();
}

function sendGroupCode(user, group) {

  i18n.setLocale(user.lang || 'fi');
  var body = '<h3>' + i18n.__("You have created a new group to TinyApp.") + '</h3>'
  + '<h4>' + i18n.__("Below is the group code. Please share the code with the relevant parents to join the group.") + '</h4>'
  + '<div style="font-size: 18px; color: #00ACAE;">'
  +   '<div>Group name: ' + group.name + '</div>'
  +   '<div>Group code: ' + group.code + '</div>'
  + '</div>'

  var email = new sendgrid.Email({
    from: 'tinyapp@noreply.fi',
    subject: i18n.__('Tiny group code'),
    html: body
  });
  email.addTo(user.local.email);

  sendgrid.send(email, function (err, json) {
    if (err) {
      return console.error(err);
    }
    console.log('Group Code Email sent to ', user.local.email);
  });

  return Promise.resolve();
}

function sendWelcome(user) {
  i18n.setLocale(user.lang || 'fi');
  var body = '<h3>' + i18n.__("Welcome, {{name}}", {name: user.username}) + '</h3>'
    + '<h4>' + i18n.__("Your account is activated and you can now login to our service. You will find FAQ and more help in the app. If you have any further questions please contact us by email hello@tinyapp.biz.") + '</h4>'
    + '<p>' + i18n.__("Thank you for joining in the family of TinyApp.") + '</p>'
    + '<br/> <br/>'
    + '<p>' + i18n.__("Kind regards,") + '</p>'
    + '<p>' + i18n.__("TinyApp Team") + '</p>';

  var email = new sendgrid.Email({
    from: 'tinyapp@noreply.fi',
    subject: i18n.__('Tiny group code'),
    html: body
  });
  email.addTo(user.local.email);

  sendgrid.send(email, function (err, json) {
    if (err) {
      return console.error(err);
    }
    console.log('Group Code Email sent to ', user.local.email);
  });

  return Promise.resolve();
}