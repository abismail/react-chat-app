import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { jqueryvalidation } from 'meteor/themeteorchef:jquery-validation';
import { Accounts } from 'meteor/accounts-base';

// import './base.html';

// Template.hello.helpers({
//   counter() {
//     return Template.instance().counter.get();
//   },
// });

// Template.hello.events({
//   'click button'(event, instance) {
//     // increment the counter when button is clicked
//     instance.counter.set(instance.counter.get() + 1);
//   },
// });

Template.login.onCreated(function(){
	console.log("this happened");
});

Template.login.events({
	'click div.btn': function(event, template){
		event.preventDefault();

		var email = template.find('#email').value, pword = template.find('#password').value;
		console.log("we have email: " + email + ", pword: " + pword);
		var res = Meteor.loginWithPassword(email, pword);
		console.log("login:");
		console.log(res);
	}
});

Template.setPassword.events({
	'mouseup div.btn': function(event, template){
		event.preventDefault();

		var pword = template.find('#password');
		console.log('password saved');
	}
});

// Template.logout.events({
// 	'mouseup div.btn': function(event, template){
// 		event.preventDefault();
// 		Meteor.logout();
// 	}
// });
