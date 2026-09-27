const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expresseror = require("./utils/expresserror.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local"); 
const passportLocalMongoose = require("passport-local-mongoose"); 
const User=require("./modales/user.js");


const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const usersRouter=require("./routes/user.js");

// ================= EJS MATE =================

app.engine("ejs", ejsMate);


// ================= MONGODB =================

const mourl = "mongodb://127.0.0.1:27017/wanderland";

main()
    .then(() => {
        console.log("connected to database");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mourl);
}


// ================= APP SETTINGS =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));


const sessionOptions={
    secret:"mysecret",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly:true,
    }

};





app.use(session(sessionOptions));
app.use(flash());


//================= PASSPORT =================

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= HOME ROUTE =================

app.use((req , res , next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.get("/demouser" , async(req , res)=>{
    let fakeuser=new User
    ({
        email:"demouser@example.com",
        username:"demouser"
    })

    let newuser=await User.register(fakeuser , "@Akshu");
    res.send(newuser);
    });


app.get("/", (req, res) => {
    res.redirect("/home");
});

// ================= HOME ROUTE =================

app.get("/home", (req, res) => {
    res.render("listings/home");
});



app.use('/listings' , listingsRouter);
app.use('/listings/:id/reviews' , reviewsRouter);
app.use('/' , usersRouter);
   



// ================= 404 ROUTE =================

app.all("/{*splat}", (req, res, next) => {

    next(
        new expresseror(
            404,
            "Page not found"
        )
    );

});


// ================= ERROR HANDLING =================

app.use((err, req, res, next) => {

    let {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error", {
        err
    });

});


// ================= START SERVER =================

app.listen(8080, () => {

    console.log(
        "server is running on port 8080"
    );
    

});