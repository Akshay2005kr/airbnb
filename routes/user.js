
const express = require("express");
const router = express.Router();

const User = require("../modales/user.js");
const wrapAsync = require("../utils/warpasync.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middielware.js");

// ================= REGISTER ROUTE =================

router.get("/signup", (req, res) => {
    res.render("users/signup");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        let newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to Airbnb!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// ================= LOGIN ROUTE =================

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post(
    "/login",
    saveredirectUrl,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }),

    async (req, res) => {
        req.flash("success", "Welcome back!");

        // Correct: use res.locals, not req.locals
        let redirectUrl = res.locals.redirectUrl || "/listings";

        res.redirect(redirectUrl);
    }
);

// ================= LOGOUT ROUTE =================

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "Successfully logged out");
        res.redirect("/listings");
    });
});

module.exports = router;
