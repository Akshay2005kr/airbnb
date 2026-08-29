const Joi = require('joi');
const Listing = require('./modales/listing');

module.exports.listingschema=Joi.object({
    Listing : Joi.object({
      title :Joi.string().required(),
      location : Joi.string().required(),
      description : Joi.string().required(),
      price :Joi.number().required().min(0),
      image :Joi.string().allow("" ,null)

    }).required(),
});