import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { xml2js } from 'meteor/peerlibrary:xml2js';
import { Email } from 'meteor/email';
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';

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

						// Send enrollment email (Accounts one didn't work for me, so I duplicated it)
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
				}

			} );
		} );
	});
});

Meteor.users.allow({
  update: function (userId, doc, fields, modifier) {
    return true;
  }
});
Groups.allow({
	update: function(userId, doc, fields, modifier) {
	   return true;
	}
});

// img upload stuff
Cloudinary.config({
	cloud_name: 'codingtest',
	api_key: '341898513945715',
	api_secret: 'IRXRSWKMeA_gxBoN15O9rMw1omg'
});