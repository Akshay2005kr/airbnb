const express=require("express");
const router=express.Router();
const warpasync = require("../utils/warpasync.js");
const expresseror = require("../utils/expresserror.js");
const { listingschema } = require("../shema.js");
const Listing = require("../modales/listing.js");



// Listing validation
const validatelisting = (req, res, next) => {

    const { error } = listingschema.validate(req.body);

    if (error) {
        throw new expresseror(400, error.message);
    }

    next();
};

// ================= INDEX ROUTE =================

router.get(
    "/",
    warpasync(async (req, res) => {

        const allListing = await Listing.find({});

        res.render("listings/index", {
            allListing
        });
    })
);


// ================= NEW ROUTE =================

router.get("/new", (req, res) => {

    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create a new listing");
        return res.redirect("/login");
    }

    res.render("listings/new");
});
// ================= SHOW ROUTE =================

router.get(
    "/:id",
    warpasync(async (req, res) => {

        let { id } = req.params;

        const listing = await Listing.findById(id)
            .populate("reviews");
        if(!listing){
            req.flash("error", "cannot fount the listing ");
            return res.redirect("/listings");
        }
        res.render("listings/show", {
            listing
        });

    })
);


// ================= CREATE LISTING =================

router.post(
    "/",
    validatelisting,
    warpasync(async (req, res) => {

        const newListing = new Listing(req.body.listings);

        await newListing.save();
        req.flash("success", "Successfully made a new listing");

        res.redirect("/listings");

    })
);


// ================= EDIT ROUTE =================

router.get(
    "/:id/edit",
    warpasync(async (req, res) => {

        let { id } = req.params;

        const listing = await Listing.findById(id);

         if(!listing){
            req.flash("error", "cannot fount the listing ");
            return res.redirect("/listings");
        }

        res.render("listings/edit", {
            listing
        });

    })
);


// ================= UPDATE ROUTE =================

router.put(
    "/:id",
    validatelisting,
    warpasync(async (req, res) => {

        let { id } = req.params;

        let listing = await Listing.findById(id);

        Object.assign(listing, req.body.listings);

        await listing.save();
        req.flash("success", "Successfully updated the listing");

        res.redirect(`/listings/${id}`);

    })
);


// ================= DELETE LISTING =================

router.delete(
    "/:id",
    warpasync(async (req, res) => {

        let { id } = req.params;

        let deletedListing =
            await Listing.findByIdAndDelete(id);
            req.flash("error", "Successfully deleted the listing");


        console.log(deletedListing);
          
        res.redirect("/listings");

    })
);


module.exports=router;
