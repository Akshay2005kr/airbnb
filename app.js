const express=require("express");
const app=express();
const mongoosh=require("mongoose"); 
const Listing=require("./modales/listing.js");
const path=require("path");
const methodOverride=require("method-override");

const mourl="mongodb://127.0.0.1:27017/wanderland";


main().then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoosh.connect(mourl)
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.get("/" ,(req, res)=>{
    res.send("hello its running");
})

  //index route for listings
app.get("/listings", async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index", { allListing });
});



     ///new rout to create new listing 
     app.get("/listings/new" , (req , res)=>{
     res.render("listings/new");
     });

//show rout 
app.get("/listings/:id" , async(req , res)=>{
    let {id}=req.params;
      const listing=await Listing.findById(id);
      res.render("listings/show" , {listing});
});

//create rout new
app.post("/listings" , async(req ,  res)=>{
     const newListing=new Listing(req.body.listings);
     await newListing.save();
      res.redirect("/listings");
    
});

//edit roudt
app.get("/listings/:id/edit" , async(req , res)=>{
     let {id}=req.params;
      const listing=await Listing.findById(id);
      res.render("listings/edit" , {listing});
});

//update route
app.put("/listings/:id" , async(req , res)=>{ 
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id , req.body.listings);
    res.redirect(`/listings/${id}`);
});

//deleate rout
app.delete("/listings/:id" , async(req , res)=>{
    let {id}=req.params;
   let delatedlisting= await Listing.findByIdAndDelete(id);
   console.log(delatedlisting);
   res.redirect("/listings");
})








// app.get("/testListing" , async (req , res)=>{
//    let sampleListing=new Listing({
//         title:"Sample Listing",
//         description:"This is a sample listing",
//         price:100,
//         location:"New York",
//         image:"",
//         country:"USA"
//    });
//       await sampleListing.save();
//       console.log("sample listing saved");
//       res.send("sample listing saved");
// });

app.listen(8080 , ()=>{
    console.log("server is running on port 8080");
})