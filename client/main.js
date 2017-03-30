import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { jqueryvalidation } from 'meteor/themeteorchef:jquery-validation';
import { Accounts } from 'meteor/accounts-base';
import { Match } from 'meteor/check';

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
	// sweetAlert("simple");
	if(Meteor.user()){
		// redirect to chat page
		Router.go('/main');
	}
});

// this just always runs
// Meteor.logout(function(err) {
// 	if(err==undefined) {
// 		sweetAlert("You are being logged out...");
// 	}
// });

// validation
Template.login.onRendered(function(){
	this.$('.login').validate({
		rules: {
			password: {
				required: true,
				minlength: 1
			},
			email: {
				required: true,
				email: true
			}
		}
	}); //not working???
});

Template.login.events({
	'click div.btn': function(event, template){
		event.preventDefault();

		var email = template.find('#email').value, pword = template.find('#password').value;
		// Match({email: String, pword: String});
		Meteor.loginWithPassword(email, pword, function(err){
			if( err==undefined ) {
				return Router.go('/main');
			} else {
				console.log("we have reason: " + err.reason);
				console.log(err);
				switch(err.reason){
					case "Incorrect password":
						sweetAlert("That password was Incorrect, please check your password and try again.");
						break;

					case "User has no password set":
						sweetAlert("No password has been set for that user. Have you used the link we sent to your inbox?");
						break;

					case "User not found":
						sweetAlert("We couldn't find a user with that email address. Is it spelt correctly?");
						break;

					case "Match failed":
						sweetAlert("Mumble, mummble, you're not speaking my language.");
						break;

					case "Unrecognized options for login request": //this case will never trigger since validation doesn't allow.
						sweetAlert("Please enter your email and password before clicking the login button.");
						break;
				}
			}
		});
	}
});

// Accounts.onLogin(function(err){
// 	// redirect to chat page
// 	Router.go('main');
// 	return this.redirect('/main');
// });

// setPassword stuff
Template.setPassword.onRendered(function(){
	this.$('.set-password').validate({
		rules: {
			password: {
				required: true,
				minlength: 1
			}
		}		
	});
});

Template.setPassword.events({
	'mouseup div.btn': function(event, template){
		event.preventDefault();

		var pword = template.find('#password');
		console.log('password saved');
	}
});

// base template stuff
Template.base.onRendered(function(){
	// deselect any selected groups
	$(".active").removeClass("active");
});

Template.base.events({
	'click .addGroup': function(){
		Router.go( '/editGroup');
	}
});

// Template.logout.events({
// 	'mouseup div.btn': function(event, template){
// 		event.preventDefault();
// 		Meteor.logout();
// 	}
// });
