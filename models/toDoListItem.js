var mongoose = require("mongoose");

var toDoListItemSchema = new mongoose.Schema({
	content: String,
	isDone: Boolean
})

module.exports = mongoose.model("toDoListItem", toDoListItemSchema);