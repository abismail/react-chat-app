Router.configure({
	waitOn: function(){
		return [
			Meteor.subscribe('groups'),
			Meteor.subscribe('users')
		];
	}
});

Router.route('/', function(){
	if ( Meteor.user() ){
		Router.go('/main');
	}
	this.render('login');
});

Router.route('/setPassword/:user_id/:token', function(){
	if ( Meteor.user() ) {
		Router.go('/main');
	} else {
		this.render('setPassword', {
			data: {
				Token: this.params.token,
				UserId: this.params.user_id
			}
		});
	}
});

Router.route('/main', function(){
	var me = Meteor.user();
	var my_groups = me.groups, group_list = [];

	var group_list = Groups.find({_id: {$in: me.groups} }).fetch();
	_.each(group_list, function(group){
		// set img.path variables so template rendering doesn't fail
		if(!group.img){
			group.img = {path: ''};
		}
	});
	this.render('base', {
		data: {
			groups: group_list
		}
	});
});

Router.route('/chat/:group_id', function(){
	// get the selected group
	var current_group = Groups.findOne({_id:this.params.group_id});
	// avoid no img exists errors
	if(!current_group.img) {
		current_group.img = {path: ''};
	}

	// get user details for selected group
	var user_list = [];//Meteor.users.find({id: {$in: current_group.users}}).fetch();
	_.each(current_group.users, function(user){
		var current_user = Meteor.users.findOne({_id:user.user_id});
		user.username = current_user.username;
		user_list.push(user);
	});

	// get the messages
	var message_list = [];
	// console.log(current_group);

	_.each(current_group.messages, function(message){
		if(message.user_id) {
			var current_user = Meteor.users.findOne({_id:message.user_id});

			var initials = /^.[A-z]|\s.[A-z]/.exec(current_user.username);
			message.user_innitial = initials.join();

			if(Meteor.userId()==message.user_id){
				message.other="";
			}else{
				message.other="other";
			}

			message_list.push(message);
		}
	});

	var me = Meteor.user();
	var group_list = Groups.find({_id: {$in: me.groups} }).fetch();
	_.each(group_list, function(group){
		// set img.path variables so template rendering doesn't fail
		if(!group.img){
			group.img = {path: ''};
		}
	});

	var is_admin = '0';
	_.each(current_group.users, function(user_info){
		if(user_info.user_id==me._id){
			is_admin = user_info.isAdmin;
		}
	});

	this.render('base', {
		data: {
			active_group: this.params.group_id,
			group_name: current_group.name,
			group_image: current_group.img.path || undefined,
			group_users: user_list,
			messages: message_list,
			groups: group_list,
			isAdmin: is_admin
		}
	});

	this.render('chat', {to: 'active'});
	this.render('editGroup', {to: 'secondary'});
});

Router.onBeforeAction(function(pause){

	if( !Meteor.user() && this.params.user_id==undefined) {
		this.redirect("/");
	}
	// This will return control to the route that was called for
	this.next();
}, {except: ['login', 'setPassword'] } );
