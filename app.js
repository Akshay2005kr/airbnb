const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expresseror = require("./utils/expresserror.js");
const session=require("express-session");


const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");


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
    saveUniitialzed: true

};

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
    res.send("hello its running");
});




app.use('/listings' , listings);
app.use('/listings/:id/reviews' , reviews);

   



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