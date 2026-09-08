const express = require("express");
const router = express.Router({ mergeParams: true });

const warpasync = require("../utils/warpasync.js");
const expresseror = require("../utils/expresserror.js");

const { reviewschema } = require("../shema.js");

const Review = require("../modales/review.js");
const Listing = require("../modales/listing.js");


// ================= REVIEW VALIDATION =================

const validatereview = (req, res, next) => {

    const { error } = reviewschema.validate(req.body);

    if (error) {
        throw new expresseror(400, error.message);
    }

    next();
};


// ================= CREATE REVIEW =================

router.post(
    "/",
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

router.delete(
    "/:reviewId",
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

        // Delete actual review
        await Review.findByIdAndDelete(reviewId);

        // Redirect
        res.redirect(`/listings/${id}`);

    })
);


module.exports = router;