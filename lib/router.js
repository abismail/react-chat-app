// import { Router } from 'meteor/iron:router';

// Router.route('/', 'login');
// Router.route('/setPassword/:user_id', 'setPassword');

// Router.onBeforeAction(function(pause){
// 	if(this.params.user_id !== undefined) {
// 		this.userId = this.params.user_id;
// 	}

// 	if(!Meteor.user()) {
// 		var this_page = this;
// 		setTimeout(function(){ this_page.redirect("/login"); }, 0);
// 	}
// }, {except: ['login', 'setPassword'] } );
