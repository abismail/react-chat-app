// editGroup stuff
Template.editGroup.onCreated(function(){
	// make user list available so we can add users to a group
	if(Roles.userIsInRole(this.userId, 'admin')){
		this.autorun( () => {
			this.subscribe("allUsers");
		});
	}
});