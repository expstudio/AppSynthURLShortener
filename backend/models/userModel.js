	var mongoose = require('mongoose');
	var encrypt = require('../services/encrypt.js');

	var userDetail = mongoose.Schema({ //define the keys in database, the keys must match these fields
		firstName: {type:String, required: '{PATH} is required!'},
		lastName: {type: String, required: '{PATH} is required.'},
		username: { 
			type: String, 
			required: true,
			unique: true
		},
		email: {
			type: String,
			required: '{PATH} is required!'
		},
		salt: {type:String, required: '{PATH} is required!' },
		hashedPassword: {type:String, required: '{PATH} is required!' },
		roles: [String],
		createdAt
	});

	/* Add methods to user Schema */
	userDetail.methods = {
		authenticate: function(passwordToMatch) {
			return encrypt.hashPwd(this.salt, passwordToMatch) === this.hashedPassword;
		},
		hasRole: function(role) {
			return this.roles.indexOf(role) > -1;
		}
	}
	var User = mongoose.model('User', userDetail)
	exports.createDefaultUsers = function() {
		User.find().exec(function(error, collection) {
			if (collection.length === 0) {
				/* when update the database, remember to remove the "users" collection first so that the collection.length === 0 */
				var salt, hash;
				salt = encrypt.createSalt();
				hash = encrypt.hashPwd(salt, 'admin');
				User.create({firstName: 'Phu', lastName: 'Pham', username:'anphu',email: 'test@gmail.com', salt: salt, hashedPassword: hash, roles: ['admin']});
			}
		});
	}
		