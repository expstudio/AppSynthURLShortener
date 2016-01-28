var mongoose = require('mongoose'),
_ = require('underscore')

var teacherSchema = new mongoose.Schema({

  // _id: { type: String, required: true, unique: true },
	fullName: String,
	DoB: String,
	spoken_languages: [],
  email: String,
  password: String
});



var Teacher = module.exports = mongoose.model('teacher', teacherSchema);


// TODO create model by mongoose check api docs or example
// 
_.extend(Teacher, {
  	post: function(obj, done) {

      var newTeacher = new Teacher();
      _.extend(newTeacher, obj);
      newTeacher.save(function(err) {
        if (err)
          throw err;
        return done(null, newTeacher);
      });
            
		},

    // get data by id 
		get: function(id, done) {
		},

    // update data by id
    put: function(id, done) {
    },
})






