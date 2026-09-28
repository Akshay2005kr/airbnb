const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const expresseror = require("./utils/expresserror.js");

const User = require("./modales/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");


// ==================================================
// EJS MATE
// ==================================================

app.engine("ejs", ejsMate);


// ==================================================
// MONGODB
// ==================================================

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


// ==================================================
// APP SETTINGS
// ==================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));


// ==================================================
// SESSION
// ==================================================

const sessionOptions = {
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};

app.use(session(sessionOptions));


// ==================================================
// PASSPORT
// ==================================================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// ==================================================
// FLASH
// ==================================================

app.use(flash());

app.use((req, res, next) => {

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    // Make logged-in user available in EJS
    res.locals.currUser = req.user;

    next();
});


// ==================================================
// DEBUG AUTHENTICATION
// ==================================================

// Remove this later after everything works

app.use((req, res, next) => {

    console.log("USER:", req.user);
    console.log("AUTHENTICATED:", req.isAuthenticated());

    next();
});


// ==================================================
// HOME ROUTES
// ==================================================

app.get("/", (req, res) => {
    res.redirect("/home");
});

app.get("/home", (req, res) => {
    res.render("listings/home");
});


// ==================================================
// LISTING ROUTES
// ==================================================

app.use("/listings", listingsRouter);


// ==================================================
// REVIEW ROUTES
// ==================================================

app.use("/listings/:id/reviews", reviewsRouter);


// ==================================================
// USER ROUTES
// ==================================================

app.use("/", usersRouter);


// ==================================================
// 404 ERROR
// ==================================================

app.all("/{*splat}", (req, res, next) => {

    next(
        new expresseror(
            404,
            "Page not found"
        )
    );

});


// ==================================================
// ERROR HANDLING
// ==================================================

app.use((err, req, res, next) => {

    let {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error", {
        err
    });

});


// ==================================================
// START SERVER
// ==================================================

app.listen(8080, () => {

    console.log("server is running on port 8080");

});