const Joi = require('joi');

module.exports.listingschema = Joi.object({
    listings: Joi.object({
        title: Joi.string().required(),

        location: Joi.string().required(),

        description: Joi.string().required(),

        price: Joi.number().required().min(0),

        image: Joi.object({
            url: Joi.string().allow("", null)
        }).allow(null)
        ,
        country: Joi.string().required()

    }).required()
});


module.exports.reviewschema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),

        rating: Joi.number()
            .required()
            .min(1)
            .max(5)

    }).required()
});