
Meteor.methods({
	'importUsers': function (emailList) {
		this.unblock();
		var users_api = "https://testapi.react.technology/users/?email="+emailList;
		var response = HTTP.get( users_api ).content;
		// Meteor.users.update('7iaRAhXQKQWEuk8Hz', {$push: {groups: 'm9thMXhSFewnEPkgu' }});

		return response;
	},
	'sendEnrollEmail': function (email, user_id) {
		this.unblock();

		// generate our own password reset token
		var token = Random.secret();
		var tokenRecord = {
			token: token,
			email: email,
			when: new Date()
		};

		Meteor.users.update(user_id, {$set: {
			"services.password.reset": tokenRecord
		}});

		// console.log("now the token for " + email + " with id:" + user_id + " is : `" + token + "`");

		// need to get host url dynamically
		Email.send({
			to: email,
			from: 'testapi@react.technology',
			subject: 'Come Chat with the Ouens',
			html: "To start chatting, set your password <a href='http://localhost:3000/setPassword/" + user_id +"/"+ token + "'>here</a> and login!"
		});
	},
	'publishData': function() {
		Meteor.publish('users', function(){
			return Meteor.users.find();
		});

		Meteor.publish('groups', function(){
			return Groups.find();
		});
	},
	'userIsAdmin': function(user_id, group_id){
		// get all admins from this group and check if this user_id is in that list OR do it the other way around so that we can just do group.users.user.isAdmin
		var my_group_info = Groups.find({_id: group_id, "users.user_id": user_id}).fetch();
		// console.log(my_group_info.isAdmin);
		return (my_group_info.isAdmin=='1');
	},

	// edit groups
	addUserToGroup: function(group_id, usr_obj) {
		Groups.update({ _id: group_id }, {
			$push: {
				users: {'user_id':user_obj.user_id, 'isAdmin':user_obj.admin}
			}
		});
		var res = Meteor.users.update(user_id, {$set: {groups: [group_id]}});
		return res;
	},

	updateGroupName: function(grp_id, grp_name){
		var update_res = Groups.update(grp_id, {$set: {name: grp_name}});
		// console.log("grp updated: " + update_res);
		return update_res;
	},
	removeUserFromGroup: function(grp_id, user_id){

		var group_update = Groups.update(
			{_id: grp_id, "users.user_id": user_id},
			{$pull: 
				{
					users: {"user_id": user_id}
				}
			}
		);
		if (group_update) {
			var user_update = Meteor.users.update(
				{_id: user_id}, 
				{$pull: { groups: grp_id}});
			// console.log(group_update);
		}
	},
	updateGroupAdmin: function(group_id, user_id, admin){
		var update_result = Groups.update(
			{_id: group_id, "users.user_id": user_id},
			{ $set: 
				{
					"users.$.isAdmin": admin
				}
			}
		);

		return update_result;
	},
	addUserToGroupWithEmail: function(user_email, group_id, is_admin){
		var user = Meteor.users.findOne({ "emails.0.address": user_email });

		if(user){
			if(user.groups.indexOf(group_id)==-1 ) {
				Groups.update({ _id: group_id }, {
					$push: {
						users: {'user_id':user._id, 'isAdmin':is_admin}
					}
				});
				var res = Meteor.users.update(user._id, {$set: {groups: [group_id]}});
			}else{
				throw new Meteor.Error(403, "That user already exists in this group.");
			}
		}else{
			throw new Meteor.Error(400, "That user doesn't exist.");
		}
	},

	// chat functions
	sendMessage: function(grp_id, msg, user_id){
		var date_obj = new Date();
		var message_obj = {user_id: user_id, message: msg, date: date_obj.toString()};
		Groups.update({_id:grp_id}, {$push: {messages: message_obj } });

		return message_obj;
	},
	addGroupImage: function(group_id, image_object){
		var update_result = Groups.update(group_id, {$set: {img: image_object } });
		return update_result;
	}
});