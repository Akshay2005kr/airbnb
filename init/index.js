const mongoose = require("mongoose");

const initdata = require("./data.js");
const Listing = require("../modales/listing.js");

const mourl = "mongodb://127.0.0.1:27017/wanderland";

async function main() {
    await mongoose.connect(mourl);
}

main()
    .then(() => {
        console.log("connected to database");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);

    console.log("database initialized with sample data");
};

initDB();