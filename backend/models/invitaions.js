var mongoose = require('mongoose'),
_ = require('underscore');




var invitaionSchema = new mongoose.Schema({
  title: String,
  color: String,
  description: String,
  groupID: String,
  availableTimes: [{availableAt: Date, available: Boolean}],
  invitees: [ {parent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, meetingAt: Date} ]
});



var Invitation = module.exports = mongoose.model('invitations', invitaionSchema);

_.extend(Invitation, {
    post: function(object, done) {

    },
    get: function(done) {
      
    }
});





