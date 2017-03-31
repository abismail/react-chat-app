import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { jqueryvalidation } from 'meteor/themeteorchef:jquery-validation';
import { Accounts } from 'meteor/accounts-base';
import { Match } from 'meteor/check';

Groups = new Meteor.Collection("groups");
// Meteor.subscribe('users');
// Meteor.subscribe('groups');

Template.login.onCreated(function(){
	// sweetAlert("simple");
	if(Meteor.user()){
		// redirect to chat page
		Router.go('/main');
	}
});

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
	});
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

// setPassword stuff
Template.setPassword.onRendered(function(){
	this.$('.setpassword').validate({
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

		var pword = template.find('#password').value, token = template.find('#token').value;
		// console.log("token: " + token + " user: " + UserId);
		Accounts.resetPassword(token, pword, function(err){
			if(err==undefined) {
				sweetAlert("Nice! Now you can start chatting!");
			}else{
				sweetAlert("There was a problem trying to set your password: " + err.reason);
			}
		});
	}
});

// base template stuff
Template.base.onRendered(function(){
	// deselect any selected groups
	$(".active").removeClass("active");
	// console.log( Roles.getGroupsForUser(this.userId) );
});

Template.base.events({
	'click .addGroup': function(){
		// Router.go( '/editGroup');
		swal({
			title: "Add Group",
			text: "Enter a name for this Group:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			animation: "slide-from-top",
			inputPlaceholder: "Group Name"
		},
		function(grp_name){
			if (grp_name === false) return false;

			if (grp_name === "") {
				swal.showInputError("We can't create a group without a name!");
				return false;
			}

			/*Meteor.call('createGroup', grp_name, function(err, res){
				if(!err){
					swal("Success!", "The group " + grp_name + " is now open.", "success");
				}else{
					console.log("An error occured while trying to create that group: " + err.reason);
				}
			});*/
			var current_user = Meteor.user(), date_obj = new Date();

			var grp_id = Groups.insert({ 
				name: grp_name,
				users: [ {user_id: this.userId, isAdmin:'1'} ],
				messages: [ {user_id: this.userId, message: current_user.username+" created this group.", date: date_obj.toString()} ]
			});
			console.log("group id: " + grp_id);

			console.log('and lookup says: ');
			var lookup = Groups.find({_id:grp_id}).fetch();
			console.log(lookup);

			// leave a lookup reference in the user collection
			var res = Meteor.users.update(this.userId, {$push: {groups: grp_id}}, function(err, docs){
				if(err){
					console.log("error");
					console.log(err);
				}
			});
			console.log("user update result: " + res);
			if (!lookup || !res) {
				console.log(res);
				swal("Fail!", "A problem occured when saving the group " + grp_name + ".", "error");
			} else {
				swal("Success!", "The group " + grp_name + " is now open.", "success");
			}
		});

		// Meteor.call('createGroup', grp_name);
	},
	'click .chat': function(evt){
		if(!evt.target.id){
			$(evt.target).parent('.chat').addClass('active');
			Router.go('/editGroup/' + $(evt.target).parent('.chat').attr('id') );
		} else {
			$(evt.target).addClass('active');
			Router.go('/editGroup/' + $(evt.target).attr('id') );
		}
		// $(this).addClass();
	}
});

Template.base.helpers({
	groups: function(){
		if(Meteor.user()){
			var current_user = Meteor.user();
			if (current_user.groups) {
				return Groups.find({_id: {$in: current_user.groups } });
			}
		}
	}
});

// editGroup stuff
Template.editGroup.onCreated(function(){
	// make user list available so we can add users to a group
	if(Roles.userIsInRole(this.userId, 'admin')){
		this.autorun( () => {
			this.subscribe("allUsers");
		});
	}
});
// Template.editGroup.events({
// 	'':function(){}
// });

// chat stuff

// Template.logout.events({
// 	'mouseup div.btn': function(event, template){
// 		event.preventDefault();
// 		Meteor.logout();
// 	}
// });

Meteor.methods({
	// edit groups
	getUserGroups: function(){
		var user_obj = Meteor.users.find({_id: this.userId});
		console.log("groups: ");
		console.log(user_obj.groups);
		return user_obj.groups;
	},
	createGroup: function(grp_name){
		// Was going to implement name uniqueness on a per-user case, but that's not required.
		// grp_name = this.userId+grp_name;

		// assume admin status for the user creating the group
		var current_user = Meteor.user(), date_obj = new Date();

		var grp_id = Groups.insert({ 
			name: grp_name,
			users: [ {user_id: this.userId, isAdmin:'1'} ],
			messages: [ {user_id: this.userId, message: current_user.username+" created this group.", date: date_obj.toString()} ]
		});
		console.log("group id: " + grp_id);

		console.log('and lookup says: ');
		var lookup = Groups.find({_id:grp_id}).fetch();
		console.log(lookup);

		// leave a lookup reference in the user collection
		var res = Meteor.users.update(this.userId, {$push: {groups: grp_id}});
		// console.log("user update result: " + res);

		return grp_id;
	},
	// addUsersToGroup: function(grp_id, usr_list) {
	// 	Groups.update({ _id: group_id }, {
	// 		$push: {
	// 			users: {'user_id':user_id, 'isAdmin':admin} 
	// 		}
	// 	});
	// 	var res = Meteor.users.update(user_id, {$set: {groups: [group_id]}});

	// 	_.each(usr_list, function(user_obj){
	// 		Groups.update()
	// 	});
	// },
	saveGroup: function(grp_id, grp_name, usr_list){

	},
	sendMessage: function(grp_id, msg){
		var date_obj = new Date();
		Groups.update({_id:grp_id}, {$push: {messages: {user_id: this.userId, message: msg, date: date_obj.toString()} } });
	},
	// userIsGroupAdmin: function(usr_id) {
	// 	// Actually just an unnecessary check and a headache, we're already checking for admin in the template

	// found how to aggregate mongo list fields here: http://stackoverflow.com/questions/15117030/how-to-filter-array-in-subdocument-with-mongodb
	// db.test.find({list: {$elemMatch: {a: 1}}}, {'list.$': 1})
	// 	// var user = Groups.aggregate({}, 
	// 	// 	{$unwind: '$users'},
	// 	// 	{$match: {'users.user_id': {$eq: usr_id} } }
	// 	// );
	// }
});
