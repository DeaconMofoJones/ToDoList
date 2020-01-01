var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	toDoListItems: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "toDoListItem"
		}
	]
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);