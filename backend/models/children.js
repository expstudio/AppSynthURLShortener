var mongoose = require('mongoose'),
_ = require('underscore')



// define schema structure for modal
var childrenSchema = new mongoose.Schema({
  parentId: [{ type: String, ref: 'parents' }],
	fullName: String,
	DoB: String,
	spoken_languages: [],
  annouced_pickup_persons: [],
  allergies: [],
  notes: String,
  disscussed_matter: [],
});


// export it outside for another use
var Teacher = module.exports = mongoose.model('childrens', childrenSchema);

// methods for model teacher such as post, get bla bla bla bla
_.extend(Teacher, {
  	post: function(object, done) {
  		// use this shit to create teacher
		},
		get: function(done) {
			
		}
})





