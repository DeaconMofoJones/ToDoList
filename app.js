var express = require("express"),
app			= express(),
mongoose	= require("mongoose"),
passport	= require("passport"),
LocalStrategy 	= require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
methodOverride 	= require("method-override"),
bodyParser 		= require("body-parser"),
ToDoListItem 	= require("./models/toDoListItem.js"),
User 			= require("./models/user.js"),
port			= process.env.PORT || 3000,
mongoLocal		= "mongodb://localhost:27017/ToDoList",
mongoServer		= "mongodb+srv://deaconmofojones:Chuletas1@merchapp-a2iob.azure.mongodb.net/ToDoList?retryWrites=true&w=majority"

//Connect to mongo database
//Primarily try to connect to local database
//Secondarily try to connect to online database
mongoose.connect(mongoLocal, { useNewUrlParser:true }, function(err){
	if (err) {
		console.log("connecting to online mongo server");
		mongoose.connect(mongoServer, {useNewUrlParser:true}, function(err){
			if (err) {
				console.log(err);
			}
			else{
				console.log("successfully connected to mongo database")
			}
		})
	} else	{
		console.log("successfully connected to local mongo database")
	}
});

//tells express to read ejs files by default.
//This makes it to where you can leave of the '.ejs' at the end of the file
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use(require("express-session")({
	secret:"coffee bean tomato spleen",
	resave: false,
	saveUninitialized: false
}))

//tells express to use passport
//we need these two lines anytime we use passport
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//===================
//		ROUTES
//===================

//INDEX
//check if user is logged in
//find user's to do list and render it
app.get("/", isLoggedIn ,function(req,res){
	User.findById(req.user._id).populate("toDoListItems").exec(function(err,user){
		if (err) {
			console.log(err)
			res.send(err);
		} else {
			res.render("main.ejs", {user:user})
		}
	})
})

//POST
//create the toDoListItem based on data passed along from the new item form
//associate the newly created item with the user who created it
app.post("/toDoListItems", isLoggedIn, function(req,res){
	toDoListItem.create(req.body.toDoListItem, function(err,createdItem){
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			console.log(createdItem);
			User.findOne({username:req.user.username}, function(err, foundUser){
				if (err) {
					console.log(err);
					res.render(err);
				} else {
					foundUser.toDoListItems.push(createdItem);
					foundUser.save(function(err, data){
						if (err) {
							console.log(err);
							res.send(err);
						} else {
							res.redirect("/toDoListItems", {user:foundUser});
						}
					})
				}
			})
		}
	})
})



//============================================
//				User Auth Routes
//============================================

//==================
//Register Routes
//==================

//register form
app.get("/register", function(req,res){
	res.render("register", {user:req.user});
})

//handle user sign up
app.post("/register", function(req,res){
	//.register hashes the password, then the callback function returns the new user with the hashed password
	//VERY IMPORTANT:
	//Never save password using new User({}).
	//Notice how the password is passed into the .register method as a second argument. This is the safe way to do it. It automatically hashes and salts the password, making it exponentially more secure then just saving the raw password to the User object in the database.
	User.register(new User({username:req.body.username}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.send(err);
		}
		//if the user is created, then log the saved user in to a session
		passport.authenticate("local")(req, res, function(){
			res.redirect("/");
		})
	})
})

//==================
//Login Routes
//==================

//show login form
app.get("/login", function(req,res){
	res.render("login", {user:req.user});
})

//handle login
app.post("/login", passport.authenticate("local",
	{
		successRedirect: "/",
		failureRedirect: "/login",
	}) , function(req,res){

})

//==================
//	Logout
//==================

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/login");
})



//==================
//	Check Logged In
//==================
function isLoggedIn(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	} else {
		console.log("user not authenticated")
		res.redirect("/login");	
	}
	
}
//==================
//	Check Admin
//==================
function isAdmin(req, res, next){
	if (req.user.username==="deaconjones") {
		return next();
	} else {
		console.log("User is not admin")
		res.send("You do not have admin privilege <a href='/'>home</a>");	
	}
	
}



app.listen(port, function(){
	console.log("ToDoList App has started")
});