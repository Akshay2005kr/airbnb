
const express = require("express");
const router = express.Router();

const User = require("../modales/user.js");
const wrapAsync = require("../utils/warpasync.js");
const passport = require("passport");

// ================= REGISTER ROUTE =================

// Display the signup page
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

// Handle user registration
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        // Get username, email, and password from the request body
        let { username, email, password } = req.body;

        // Create a new user with username and email
        let newUser = new User({ email, username });

        // Register the user and securely hash the password
        const registeredUser = await User.register(newUser, password);

        // Display the registered user in the console
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
             // Show success message and redirect to listings
        req.flash("success", "Welcome to Airbnb!");
        res.redirect("/listings");
        })


       

    } catch (e) {
        // Show the error message and redirect back to signup
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// ================= LOGIN ROUTE =================

// Display the login page
router.get("/login", (req, res) => {
    res.render("users/login");
});

// Authenticate the user using Passport Local Strategy
router.post(
    "/login",

    passport.authenticate("local", {
        failureFlash: true,       // Display an error message if login fails
        failureRedirect: "/login" // Redirect to login page if authentication fails
    }),

    (req, res) => {
        // Show success message after successful login
        req.flash("success", "Welcome back!");

        // Redirect to listings after login
        res.redirect("/listings");
    }
);

// ================= LOGOUT ROUTE =================

// Log out the currently authenticated user
router.get("/logout", (req, res, next) => {
    req.logout((err) => {

        // Pass logout errors to Express error handling
        if (err) {
            return next(err);
        }

        // Show success message after logout
        req.flash("success", "Successfully logged out");

        // Redirect to listings after logout
        res.redirect("/listings");
    });
});

// Export the router so it can be used in app.js
module.exports = router;
