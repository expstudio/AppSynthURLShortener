var mongoose = require('mongoose'),
_ = require('underscore')




var groupSchema = new mongoose.Schema({
	teacherId: [{ type: String, ref: 'teachers' }],
	childrenId: [{ type: String, ref: 'children' }],
});



var Group = module.exports = mongoose.model('groups', groupSchema);

_.extend(Group, {
  	post: function(object, done) {

		},
		get: function(done) {
			
		}
})





