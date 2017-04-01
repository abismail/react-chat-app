import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { jqueryvalidation } from 'meteor/themeteorchef:jquery-validation';
import { Accounts } from 'meteor/accounts-base';
import { Match } from 'meteor/check';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';

Groups = new Meteor.Collection("groups");

// handlebars helper
Template.registerHelper('equals', function(var1, var2){
	return var1===var2;
});

// login stuff
Template.login.onCreated(function(){
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
	'click div.btn': function(event, template){
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
	// fix group image
	$(".chats .chat .picture").each(function(){
		var img = $(this).data("group-image");
		if(img){
			$(this).css("background", "url("+img+") no-repeat");
		}
	});
});

Template.base.events({
	'click .addGroup': function(){
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
			if (grp_name === false){
				return false;
			}

			if (grp_name === "") {
				swal.showInputError("We can't create a group without a name!");
				return false;
			}

			var current_user = Meteor.user(), date_obj = new Date();

			var grp_id = Groups.insert({ 
				name: grp_name,
				users: [ {user_id: current_user._id, isAdmin:'1'} ],
				messages: [ {user_id: current_user._id, message: current_user.username+" created this group.", date: date_obj.toString()} ]
			});
			// console.log("group id: " + grp_id);

			// console.log('and lookup says: ');
			var lookup = Groups.find({_id:grp_id}).fetch();
			// console.log(lookup);

			// leave a lookup reference in the user collection
			var res = Meteor.users.update(current_user._id, {$push: {groups: grp_id}}, function(err, docs){
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
	},
	'click .chat': function(evt){
		// deselect currently selected groups
		$(".chat").removeClass("active");

		if(!evt.target.id){
			$(evt.target).parent('.chat').addClass('active');
			Router.go('/chat/' + $(evt.target).parent('.chat').attr('id') );
		} else {
			$(evt.target).addClass('active');
			Router.go('/chat/' + $(evt.target).attr('id') );
		}
		// $(this).addClass();
	}
});

// editGroup stuff
Template.editGroup.onRendered(function(){
	// temporary fix
	$("#name").attr("value", $("#name").data("group-name"));

	// set group image in editor
	if($(".profilePicture").data("group-image")) {
		$(".profilePicture").css("background", "url("+ $(".profilePicture").data("group-image") +") no-repeat");
	}
});

Template.editGroup.events({
	// 'keyup #name': function(event) {
	// 	$("#name")event.target.value;
	// },
	'click .save.btn':function(event){

		var grp_id  = $('#name').data('group-id');
		// console.log(grp_id, $('#name').val());

		Meteor.call('updateGroupName', grp_id, $('#name').val(), function(err, res){
			if(err==undefined){
				$(".chatName").html($('#name').val());
				sweetAlert("Group Name updated Successfully!", "success");
			}else{
				console.log("error updating group name:" + err.reason);
			}
		});
	},
	'click .remove_user': function(event){
		var user_id = $(event.target).parent('.user_detail').data('user-id'), group_id = $("#name").data("group-id");
		console.log('removing: ' + user_id + " from group: " + group_id);
		if(user_id==this.userId){
			sweetAlert("You can't remove yourself from this group.", "error");
		}else{
			swal({
			        title: "Confirm",
			        text: "Are you sure you want to remove this user?",
			        type: "warning",
			        showCancelButton: true,
			        confirmButtonColor: "#DD6B55",
			        confirmButtonText: "Yes",
			        cancelButtonText: "No",
			        closeOnConfirm: false,
			        closeOnCancel: false 
			    },
			    function(isConfirm) {
			        if (isConfirm) {
			            Meteor.call('removeUserFromGroup', group_id, user_id, function(err){
							if(err==undefined){
								$(event.target).parent('.user_detail').remove();
								sweetAlert("User removed successfully.", "success");
							}else{
								console.log('error:' + err.reason);
							}
						});
			        }
			    }
			);
		}
	},
	'click .update_admin': function(event) {
		var admin_val = '0';
		if(event.target.checked){
			admin_val = '1';
		}else{
			admin_val = '0';
		}

		var group_id = $("#name").data("group-id");

		var user_id = $(event.target).closest(".user_detail").data("user-id");

		Meteor.call('updateGroupAdmin', group_id, user_id, admin_val, function(err, res){
			if(err==undefined){
				sweetAlert("Update successful!", "User updated successfully", "success");
			}else{
				console.log('error:' + err.reason);
			}
		});

	},
	'click .cancel.btn': function(event){
		$(".primary-view").show('slow');
		$(".secondary-view").hide('slow');
	},
	'click .members .add': function(event) {
		var group_id = $("#name").data("group-id");
		//'afoster1@economist.com'
		swal({
			title: "Add Member",
			text: "Enter the email address of the user you want to add:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			animation: "slide-from-top",
			inputPlaceholder: "Member Email"
		},
		function(email){
			if (email === false){
				return false;
			}

			if (email === "") {
				swal.showInputError("We can't add a member without an email!");
				return false;
			}

			Meteor.call('addUserToGroupWithEmail', email, group_id, '0', function(err, res){
				if (err) {
					swal("Fail!", "A problem occured when adding the member for " + email + ".", "error");
				} else {
					swal("Success!", "Member successfully added.", "success");
				}
			});
		});
	},
	'change .profilePicture input[type="file"]': function(event){
		event.preventDefault();
		var group_id = $("#name").data("group-id");

		// show loading spinner
		$(".profilePicture .spinner").show();

		var pic = $(event.target)[0].files[0];
		var img = {name: pic.name};

		Cloudinary.upload(pic, function(err, res){
			if(err==undefined){
				img.path=res.url;
				// img.secure_path=res.secure_url; //don't need https paths

				// persist changes to db
				Meteor.call('addGroupImage', group_id, img, function(err, res){
					if(!err){
						$(".profilePicture .spinner").hide();
						$(".profilePicture").css("background", "url("+img.path+") no-repeat");
						$(".chats .chat.active .picture").css("background", "url("+img.path+") no-repeat");
						sweetAlert("Looking good!", "Group Image added successfully!", "success");
					}else{
						console.log("group update failed: " + err.reason);
					}
				});
			} else {
				console.log("Upload error: " + err.reason);
			}
		});
	}
});

// chat stuff
Template.chat.onRendered(function(){
	$(".secondary-view").hide();
	
	// make the current group selected
	var group_id = $(".secondary-view #name").data('group-id');
	$(".chats .chat#"+group_id).addClass("active");

	// automatically show latest message in list
	var latest_message_offset = $(".message").last().offset();
	$("html, body").animate({
		scrollTop: latest_message_offset.top-20,
		scrollLeft: latest_message_offset.left-20,
	});
});

Template.chat.events({
	'click .editGroup': function(event) {
		$(".primary-view").hide('slow');
		$(".secondary-view").show('slow');
	},
	'keyup .newMessage textarea': function(event){
		console.log($(event.target).val());
		var msg = $(event.target).val();

		if( msg ) {
			$(".send").removeClass("active");

			$.post('http://sentiment.vivekn.com/api/text/', {txt: msg}, function(data){
				var confidence = parseFloat(data.result.confidence);
				switch(true) {
					case (confidence > 80 && data.result.sentiment.toLowerCase()=="negative"):
						// remove other classes
						$(".indicator").removeClass("positive");

						// show negative
						$(".indicator").addClass("negative");
						break;

					case data.result.sentiment.toLowerCase()=="neutral":
						$(".indicator").removeClass("positive");
						$(".indicator").removeClass("negative");
						break;
					case  data.result.sentiment.toLowerCase()=="positive":
						// remove other possible classes
						$(".indicator").removeClass("negative");

						// show positive
						$(".indicator").addClass("positive");
						break;
				}

				// enable send btn
				$(".send").addClass("active");
			});
		} else {
			$(".indicator").removeClass("positive");
			$(".indicator").removeClass("negative");

			if(!msg){
				$(".send").removeClass("active");
			}
		}
	},
	'click .send': function(event){
		if(!$(event.target).hasClass("active")){
			console.log('that\'s a a damn shame');
		}else{
			var group_id = $(".secondary-view #name").data('group-id');
			var txt = $(".newMessage textarea").val();
			var user = Meteor.user();

			if($(".indicator").hasClass("negative")) {
				swal({
				        title: "Are you sure?",
				        text: "We have detected that your message is potentially negative.",
				        type: "warning",
				        showCancelButton: true,
				        confirmButtonColor: "#DD6B55",
				        confirmButtonText: "Send",
				        cancelButtonText: "Don't Send",
				        closeOnConfirm: true,
				        closeOnCancel: false 
				    },
				    function(isConfirm) {
				        if (isConfirm) {
				            Meteor.call('sendMessage', group_id, txt, user._id, function(err, message){
								if(err==undefined){
									// add message to the session var groupMessages
									// console.log("success");
									$(".newMessage textarea").val('');
								}else{
									console.log('error:' + err.reason);
								}
								return false;
							});
				        } else {
				            swal("Cancelled", "Phew!", "error");
				        }
				    }
				);
			} else {
				Meteor.call('sendMessage', group_id, txt, user._id, function(err, message){
					if(err==undefined){
						// add message to the session var groupMessages
						// console.log("success");
						$(".newMessage textarea").val('');
					}else{
						console.log('error:' + err.reason);
					}
				});
			}
		}
	}
});


// Template.logout.events({
// 	'mouseup div.btn': function(event, template){
// 		event.preventDefault();
// 		Meteor.logout();
// 	}
// });


Meteor.users.allow({
  update: function (userId, doc, fields, modifier) {
  	console.log('hit');
    return true;
  }
});
