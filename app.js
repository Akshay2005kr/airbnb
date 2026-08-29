const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./modales/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const warpasync = require("./utils/warpasync.js");
const expresseror=require("./utils/expresserror.js");
const { error } = require("console");
const { required, listingschema } = require("./shema.js");


// EJS Mate
app.engine("ejs", ejsMate);


// MongoDB
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


// App settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// Home route
app.get("/", (req, res) => {
    res.send("hello its running");
});

const validatelisting = (req, res, next) => {
    const { error } = listingschema.validate(req.body);

    if (error) {
        throw new expresseror(400, error.message);
    }else{

    next();
    }
};



// INDEX ROUTE
app.get("/listings",  warpasync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index", { allListing });
}));


// NEW ROUTE
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});


// SHOW ROUTE
app.get("/listings/:id",  warpasync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    res.render("listings/show", { listing });
}));


// CREATE ROUTE
app.post("/listings" ,validatelisting, warpasync(async (req, res, next) => {
    const newListing = new Listing(req.body.listings);
    // Save to MongoDB
    await newListing.save();
    // Redirect after successful save
    res.redirect("/listings");
}));



// EDIT ROUTE
app.get("/listings/:id/edit",  warpasync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    res.render("listings/edit", { listing });
}));


// UPDATE ROUTE
app.put("/listings/:id",validatelisting , warpasync(async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);

    Object.assign(listing, req.body.listings);

    await listing.save();

    res.redirect(`/listings/${id}`);
}));


// DELETE ROUTE
app.delete("/listings/:id",  warpasync(async (req, res) => {
    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    res.redirect("/listings");
}));

//for new rout
app.all("/{*splat}", (req, res, next) => {
    next(new expresseror(404, "Page not found"));
});

//midalwar manage
// Error handling middleware
app.use((err, req, res, next) => {
    let {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error", { err });
});
// START SERVER
app.listen(8080, () => {
    console.log("server is running on port 8080");
});