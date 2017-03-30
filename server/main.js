import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { xml2js } from 'meteor/peerlibrary:xml2js';
import { Email } from 'meteor/email';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(() => {
	// set env vars
	process.env.MAIL_URL="smtp://testapi%40react.technology:ccCrkkfDmJVjBWLQ@smtp.mailgun.org:587"; //Authentication error, email server auth failing

	// prepare email template
	Meteor.call('prepareEmailTemplate');

	var Users = Meteor.users;

	// import users
	Meteor.call('importUsers', 'ismail29033@gmail.com,john@gmail.com', function(err, res) {
		var users_xml = xml2js.parseString( res, function(xmlerror, xmlresult){

			_.each(xmlresult.Users.User, function (user) {
				var insert_obj = {username: user.Name[0]+' '+user.Surname[0], email:user.Email[0]};
				var user_id = null;

				var existing_user = Accounts.findUserByEmail(insert_obj.email);
				console.log("existing_user for wemail "+insert_obj.email+" is: "+existing_user);
				if (existing_user==null || typeof(existing_user)!=="object"){ //won't work in the case that users have multiple emails, but we're not working with such users right now.
					
					// check if duplicate user name exists in case of 'Test \d' usernames
					existing_user = Accounts.findUserByUsername(insert_obj.username);
					if (existing_user==null || typeof(existing_user)=="object") {
						user_id = Accounts.createUser( insert_obj );
					} else {
						// add the new email address
						Accounts.addEmail(existing_user._id, insert_obj.email);
						// remove the old email
						Accounts.removeEmail(existing_user._id, existing_user.email);
					}
					console.log("uid: "+user_id);


					if( insert_obj.email == "ismail29033@gmail.com" ) {
						// make myself an admin
						Roles.addUsersToRoles(user_id, ['admin']);

						// Already working, so commenting this out to avoid spam temporarily.
						// Meteor.call('sendEnrollEmail', insert_obj.email, user_id, function(error, result){
			  	// 			if ( error===undefined ) {
			  	// 				console.log("Email sent successfuly!");
			  	// 			} else {
			  	// 				console.log("There was an error when trying to email: " + insert_obj.email + " error: " + error);
			  	// 			}
			  	// 		});

			  			//not working, we'll just have to put the token in the default email
			  			// Accounts.sendEnrollmentEmail(user_id);
					}else{
						Roles.addUsersToRoles(user_id, ['normal']);
						Accounts.setPassword(user_id, "password"); // for testing purposes.
					}

					// to test login
					if (insert_obj.email == "john@gmail.com") {
						Accounts.setPassword(user_id, "sakeenah");
					}

				}

			} );
		} );
	});
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
		// need to get host url dynamically
		Email.send({
			to: email,
			from: 'testapi@react.technology',
			subject: 'Come Chat with the Ouens',
			html: "To start chatting, set your password <a href='http://localhost:3000/setPassword/" + user_id + "'>here</a> and login!"
		});
	},
	'prepareEmailTemplate': function() {
		Accounts.emailTemplates.siteName = 'ChatApp';
		Accounts.emailTemplates.from = 'Blah Admin <testapi@react.technology>';

		Accounts.emailTemplates.enrollAccount.subject = (user) => {
		  return `Come and have a chat with the ouens, ${user.username}`;
		};

		Accounts.emailTemplates.enrollAccount.text = (user, url) => {
		  return 'Come and chat with us!'
		    + ' To activate your account, simply click the link below:\n\n'
		    + url;//`http://localhost:3000/setPassword/${user._id}`;
		};
	}
});
