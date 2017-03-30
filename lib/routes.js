Router.route('/', function(){
	this.render('login');
});

Router.route('/main', function(){
	this.render('base');
	// this.render('editGroup', {to: 'active'});
	//this.render('chat', {to: 'active'});
});

Router.route('/editGroup', function(){
	this.render('base');
	this.render('editGroup', {to: 'active'});
});

Router.route('/editGroup/:group_id', function(){
	this.render('base');
	this.render('editGroup', {to: 'active'});
});


Router.route('/chat/:group_id', function(){
	this.render('base');
	this.render('chat', {to: 'active'});
	this.render('editGroup', {to: 'secondary'}); // for settings button
});

Router.route('/setPassword/:user_id', function(){
	this.render('setPassword');
});
// Router.route('/', 'login');
// Router.route('/login', 'login');

Router.onBeforeAction(function(pause){
	if(this.params.user_id !== undefined) {
		this.userId = this.params.user_id;
		console.log("got it: " + this.userId);
	}

	var this_page = this;
	if( !Meteor.user() ) {
		this.redirect("/");
	}else{
		// This will return control to the route that was called for
		this.next();
	}
}, {except: ['setPassword'] } );
