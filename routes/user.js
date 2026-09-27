const express = require("express");
const router = express.Router();

const User = require("../modales/user.js");
const wrapAsync = require("../utils/warpasync.js");
const passport = require("passport");

// ================= REGISTER ROUTE =================

router.get("/signup", (req, res) => {
    res.render("users/signup");
});

// ================= LOGIN ROUTE =================

router.post("/signup", wrapAsync(   async (req, res) => {
    try {
     let { username , email , password}=req.body;
     let newUser = new User({email , username });
    const registeredUser =   await User.register(newUser, password);
    console.log(registeredUser);
     req.flash("success", "Successfully signed up! Please log in.");
     res.redirect("/listings");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
        keepSessionInfo: true
    }),
    async (req, res) => {
        res.redirect("/listings");
    }
);
 
module.exports = router;