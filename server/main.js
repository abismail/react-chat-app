import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { xml2js } from 'meteor/peerlibrary:xml2js';
import { Email } from 'meteor/email';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(() => {
	// set env vars
	process.env.MAIL_URL="smtp://testapi%40react.technology:ccCrkkfDmJVjBWLQ@smtp.mailgun.org:587"; //Authentication error, email server auth failing

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
						// Already working, so commenting this out to avoid spam temporarily.
						// Meteor.call('sendEnrollEmail', insert_obj.email, user_id, function(error, result){
			  	// 			if ( error===undefined ) {
			  	// 				console.log("Email sent successfuly!");
			  	// 			} else {
			  	// 				console.log("There was an error when trying to email: " + insert_obj.email + " error: " + error);
			  	// 			}
			  	// 		});
					}

					// to test login
					if (insert_obj.email == "john@gmail.com") {
						Accounts.setPassword(user_id, "sakeenah");
					}

				}

			} );

			// console.log("this is what my users look like: " );
			// console.log(Users.find({}).fetch());
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
	'setPassword': function(user_id, password) {
		var users = Meteor.users;
		var user_obj = users.findOne({_id:user_id});
		users.update(user_id, user_obj);
	},
	// 'loginUser': function(usr_email, usr_pass) {
	// 	var login_user = Meteor.users.findOne({email: usr_email, password: usr_pass});
	// 	console.log("found user login: ");
	// 	console.log(login_user);
	// }
});
