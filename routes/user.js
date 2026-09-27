const express = require("express");
const router = express.Router();

const User = require("../modales/user.js");
const wrapAsync = require("../utils/warpasync.js");

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

module.exports = router;