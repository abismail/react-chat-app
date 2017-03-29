import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './setPassword.html';

Meteor.subscribe("users");

Template.setpassword.events({
	'click .btn': function(event, instance){
		// 
	}
});