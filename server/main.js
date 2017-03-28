import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { xml2js } from 'meteor/peerlibrary:xml2js';
import { Email } from 'meteor/email';

Meteor.startup(() => {
	// set env vars
	process.env.MAIL_URL="smtp://testapi%40react.technology.mailgun.org:ccCrkkfDmJVjBWLQ@smtp.mailgun.org:587"; //Authentication error, email server auth failing

	// import users
	Users = new Mongo.Collection('users');
	Meteor.call('importUsers', 'ismail29033@gmail.com,sakeenahroberts1@gmail.com', function(err, res) {
		var users_xml = xml2js.parseString( res, function(xmlerror, xmlresult){

			_.each(xmlresult.Users.User, function (user) {
				var insert_obj = {name: user.Name, surname:user.Surname, email:user.Email};
				console.log("inserting: " + insert_obj.name + ", " + insert_obj.surname + ", " + insert_obj.email);
				var user_id = null;
				
				var update_res = Users.update({email:user.Email}, insert_obj);
				
				if (update_res == 0) {
					user_id = Users.insert(insert_obj);
				}

				if( insert_obj.email == "ismail29033@gmail.com" ) {
					// Meteor.call('sendEnrollEmail', [insert_obj.email, user_id], function(error, result){
		  	// 			if ( !result ) {
		  	// 				console.log("There was an error when trying to email: " + insert_obj.email + " error: " + error);
		  	// 			}
		  	// 		});
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
		Email.send({
			to: email,
			from: 'testapi@react.technology',
			subject: 'Come Chat with the Ouens',
			text: "To start chatting, set your password <a href='http://localhost:3000/setPassword.html?uid=" + user_id + "'>here</a> and login!"
		});
	}
});
