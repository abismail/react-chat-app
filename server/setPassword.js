import { Meteor } from 'meteor/meteor';

Users = new Mongo.Collection('users');

Meteor.startup(() => {
	// Meteor.publish("users", function(){
	// 	return Users.find
	// });
});

Meteor.methods({
	'setUserPassword': function(user_id, email) {
		// 
	}
});
