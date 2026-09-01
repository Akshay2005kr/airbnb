const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./modales/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const warpasync = require("./utils/warpasync.js");
const expresseror = require("./utils/expresserror.js");

const { listingschema, reviewschema } = require("./shema.js");
const Review = require("./modales/review.js");


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


// ================= HOME ROUTE =================

app.get("/", (req, res) => {
    res.send("hello its running");
});


// ================= VALIDATION MIDDLEWARE =================

// Listing validation
const validatelisting = (req, res, next) => {

    const { error } = listingschema.validate(req.body);

    if (error) {
        throw new expresseror(400, error.message);
    }

    next();
};


// Review validation
const validatereview = (req, res, next) => {

    const { error } = reviewschema.validate(req.body);

    if (error) {
        throw new expresseror(400, error.message);
    }

    next();
};


// ================= INDEX ROUTE =================

app.get(
    "/listings",
    warpasync(async (req, res) => {

        const allListing = await Listing.find({});

        res.render("listings/index", {
            allListing
        });
    })
);


// ================= NEW ROUTE =================

app.get("/listings/new", (req, res) => {

    res.render("listings/new");

});


// ================= SHOW ROUTE =================

app.get(
    "/listings/:id",
    warpasync(async (req, res) => {

        let { id } = req.params;

        const listing = await Listing.findById(id)
            .populate("reviews");

        res.render("listings/show", {
            listing
        });

    })
);


// ================= CREATE LISTING =================

app.post(
    "/listings",
    validatelisting,
    warpasync(async (req, res) => {

        const newListing = new Listing(req.body.listings);

        await newListing.save();

        res.redirect("/listings");

    })
);


// ================= EDIT ROUTE =================

app.get(
    "/listings/:id/edit",
    warpasync(async (req, res) => {

        let { id } = req.params;

        const listing = await Listing.findById(id);

        res.render("listings/edit", {
            listing
        });

    })
);


// ================= UPDATE ROUTE =================

app.put(
    "/listings/:id",
    validatelisting,
    warpasync(async (req, res) => {

        let { id } = req.params;

        let listing = await Listing.findById(id);

        Object.assign(listing, req.body.listings);

        await listing.save();

        res.redirect(`/listings/${id}`);

    })
);


// ================= DELETE LISTING =================

app.delete(
    "/listings/:id",
    warpasync(async (req, res) => {

        let { id } = req.params;

        let deletedListing =
            await Listing.findByIdAndDelete(id);

        console.log(deletedListing);

        res.redirect("/listings");

    })
);


// ======================================================
//                    REVIEW ROUTES
// ======================================================


// ================= CREATE REVIEW =================

app.post(
    "/listings/:id/reviews",
    validatereview,
    warpasync(async (req, res) => {

        // Find listing
        let listing = await Listing.findById(req.params.id);

        // Create review
        let newReview = new Review(req.body.review);

        // Add review to listing
        listing.reviews.push(newReview);

        // Save review
        await newReview.save();

        // Save listing
        await listing.save();

        // Redirect
        res.redirect(`/listings/${listing._id}`);

    })
);


// ================= DELETE REVIEW =================

app.delete(
    "/listings/:id/reviews/:reviewId",
    warpasync(async (req, res) => {

        let { id, reviewId } = req.params;

        // Remove review ID from Listing
        await Listing.findByIdAndUpdate(
            id,
            {
                $pull: {
                    reviews: reviewId
                }
            }
        );

        // Delete actual review from Review collection
        await Review.findByIdAndDelete(reviewId);

        // Redirect back to listing
        res.redirect(`/listings/${id}`);

    })
);


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