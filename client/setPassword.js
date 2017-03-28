import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './setPassword.html';

Users = new Mongo.Collection('users');
// var users = Users.find({}).fetch();

Template.setpassword.events({
	'click .btn': function(event, instance){
		// 
	}
});