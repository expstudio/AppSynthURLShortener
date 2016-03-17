var mongoose = require('mongoose'),
_ = require('underscore');




var eventSchema = new mongoose.Schema({
	title: String,
	start: String,
	end: String,
	className: [String],
	editable: {
        type: Boolean,
        default: true
      },
	allDay: {
        type: Boolean,
        default: false
      },
	isPublished: {
        type: Boolean,
        default: false
      },
	color: String,
	description: String,
	groupID: String,
	isRepeatable: {
        type: Boolean,
        default: false
      },
	repeating: String,
	dow: [Number],
	repeating_day_of_month: Number
});



var Event = module.exports = mongoose.model('events', eventSchema);

_.extend(Event, {
  	post: function(object, done) {

		},
		get: function(done) {
			
		}
});





