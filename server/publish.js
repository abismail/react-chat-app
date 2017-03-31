Groups = new Meteor.Collection("groups");
Meteor.publish("users", function(){
	return Meteor.users.find({_id: this.userId}, { fields: { groups: 1 } });
});

Meteor.publish("groups", function(){
	// if ( this.userId) {
	// 	var current_user = Meteor.users.findOne({_id: this.userId});
	// 	// console.log("user_grps: "); console.log(current_user.groups);
	// 	return Groups.find({_id: {$in: current_user.groups}});
	// }else{
		return Groups.find();
	// }
});