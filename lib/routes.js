Router.route('/', function(){
	if ( Meteor.user() ){
		Router.go('/main');
	}
	this.render('login');
});

Router.route('/main', function(){
	this.render('base');
	// this.render('editGroup', {to: 'secondary'});
});

Router.route('/editGroup', function(){
	this.render('base');
	this.render('editGroup', {to: 'active'});
});

Router.route('/chat', function(){
	this.render('base');
	this.render('chat', {to: 'active'});
});

Router.route('/editGroup/:group_id', function(){
	this.render('base', {
		data: {
			edit_group: this.params.group_id
		}
	});
	this.render('editGroup', {to: 'active'});
});

Router.route('/chat/:group_id', function(){
	this.render('base');
	this.render('chat', {to: 'active'});
	this.render('editGroup', {to: 'secondary'}); // for settings button
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

Router.onBeforeAction(function(pause){

	if( !Meteor.user() && this.params.user_id==undefined) {
		this.redirect("/");
	}
	// This will return control to the route that was called for
	this.next();
}, {except: ['login', 'setPassword'] } );
