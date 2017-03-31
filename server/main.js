import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { xml2js } from 'meteor/peerlibrary:xml2js';
import { Email } from 'meteor/email';
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';

// replace this email address with your own one:
ConfigurableEmail="ismail29033@gmail.com";

Meteor.startup(() => {
	// set env vars
	process.env.MAIL_URL="smtp://testapi%40react.technology:ccCrkkfDmJVjBWLQ@smtp.mailgun.org:587"; //Authentication error, email server auth failing

	// #REMOVE the following 2lines
	// var uid = Accounts.findUserByEmail(ConfigurableEmail);
	// Meteor.users.remove({});//_id:uid
	
	DefaultGroupId = Groups.findOne({name:'default'});
	if(!DefaultGroupId){
		DefaultGroupId = Groups.insert({name:'default', users: []});
	}

	var Users = Meteor.users;

	// import users
	Meteor.call('importUsers', ConfigurableEmail+',john@gmail.com', function(err, res) {
		var users_xml = xml2js.parseString( res, function(xmlerror, xmlresult){

			_.each(xmlresult.Users.User, function (user) {
				var insert_obj = {username: user.Name[0]+' '+user.Surname[0], email:user.Email[0]};
				var user_id = null;


				var existing_user = Accounts.findUserByEmail(insert_obj.email);

				// no user found with this email, insert a new one or update the user with the same username
				if (existing_user==null || typeof(existing_user)!=="object" || existing_user==undefined ) {//won't work in the case that users have multiple emails, but we're not working with such users right now.
					// check if duplicate user name exists in case of 'Test \d' usernames
					existing_user = Accounts.findUserByUsername(insert_obj.username);
					if (existing_user==null || typeof(existing_user)=="object" || existing_user==undefined) {
						user_id = Accounts.createUser( insert_obj );
					} else {
						// add the new email address
						Accounts.addEmail(existing_user._id, insert_obj.email);
						// remove the old email
						Accounts.removeEmail(existing_user._id, existing_user.email);
						user_id = existing_user._id;
					}

					// belongs in the above if block, but for testing we put this out here
					if( insert_obj.email == ConfigurableEmail ) {
						// make myself an admin
						Meteor.call('addUserToGroup', user_id, '1', DefaultGroupId);

						// Roles.addUsersToRoles( user_id, 'admin');
						// Roles.addUsersToRoles( user_id, ['admin', 'chatter'], 'Default');

						// Already working, so commenting this out to avoid spam temporarily.
						Meteor.call('sendEnrollEmail', insert_obj.email, user_id, function(error, result){
			  				if ( error==undefined ) {
			  					console.log("Email sent successfuly!");
			  				} else {
			  					console.log("There was an error when trying to email: " + insert_obj.email + " error: " + error);
			  				}
			  			});
					}else{
						// add all other users as non admins to the default group
						Meteor.call('addUserToGroup', user_id, '0', DefaultGroupId);

						// for testing purposes. #REMOVE
						Accounts.setPassword(user_id, "password");
					}

					// to test login #REMOVE
					if (insert_obj.email == "john@gmail.com") {
						Accounts.setPassword(user_id, "sakeenah");
					}
				}
				// for testing purposes.
				else {
					if (existing_user.emails[0].address==ConfigurableEmail){
						

						// Meteor.call('getGroupsForUser', existing_user._id, function(err, res) {
						// 	if(err==undefined) {
						// 		console.log("we have groups: ");
						// 		console.log(res);
						// 	} else {
						// 		console.log("There was a problem ");
						// 	}
						// });
					}
				}

			} );
		} );
	});
	console.log(Groups.find({}).fetch());
});

Meteor.methods({
	'importUsers': function (emailList) {
		this.unblock();
		var users_api = "https://testapi.react.technology/users/?email="+emailList;
		var response = HTTP.get( users_api ).content;

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

		console.log("now the token for " + email + " with id:" + user_id + " is : `" + token + "`");

		// need to get host url dynamically
		Email.send({
			to: email,
			from: 'testapi@react.technology',
			subject: 'Come Chat with the Ouens',
			html: "To start chatting, set your password <a href='http://localhost:3000/setPassword/" + user_id +"/"+ token + "'>here</a> and login!"
		});
	},
	'getGroupsForUser': function(user_id) {
		var user = Meteor.users.findOne( { _id: user_id } );
		console.log("groups: ");
		console.log(user);
		return user.groups;
	},
	'addUserToGroup': function(user_id, admin, group_id) {
		Groups.update({ _id: group_id }, {
			$push: {
				users: {'user_id':user_id, 'isAdmin':admin} 
			}
		});
		var res = Meteor.users.update(user_id, {$set: {groups: [group_id]}});
		// console.log(res);
	},
	'createGroup': function(group_name){
		// 
	},
	'publishData': function() {
		Meteor.publish('users', function(){
			return Meteor.users.find();
		});

		Meteor.publish('groups', function(){
			return Groups.find();
		});
	}
	// Failed
	// 'prepareEmailTemplate': function() {
	// 	Accounts.emailTemplates.siteName = 'ChatApp';
	// 	Accounts.emailTemplates.from = 'Blah Admin <testapi@react.technology>';

	// 	Accounts.emailTemplates.enrollAccount.subject = (user) => {
	// 		return `Come and have a chat with the ouens, ${user.username}`;
	// 	};

	// 	Accounts.emailTemplates.enrollAccount.text = (user, url) => {
	// 		console.log("using enrollmentLink: " + url );
	// 	  	return 'Come and chat with us!'
	// 	    	+ ' To activate your account, simply click the link below:\n\n'
	// 	    	+ url;//`http://localhost:3000/setPassword/${user._id}`;
	// 	};
	// 	console.log('enrollAccount template object: ');
	// 	console.log(Accounts.emailTemplates.enrollAccount);
	// }
});
