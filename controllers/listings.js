const Listing = require("../models/listing.js");
const axios = require("axios");
const MAP_TOKEN = process.env.MAP_TOKEN;

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{    
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews",populate:{path: "author",} }).populate("owner");;
    
    if(!listing)
    {
        req.flash("error","Requested listing does not exists");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{ listing, MAP_TOKEN: process.env.MAP_TOKEN  });
}

module.exports.createListing = async (req,res,next)=>
{
    try{
        let url = req.file.path;
    let filename = req.file.filename;

    const address = req.body.listing.location; // Assuming location field exists
    const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAP_TOKEN}`;
    const geoResponse = await axios.get(geoUrl);
    if (!geoResponse.data.features.length) {
        req.flash("error", "Could not find location, please enter a valid address.");
        return res.redirect("/listings/new");
    }
    
    //console.log(geoResponse.data.features[0].geometry);
    let coordinates = [0, 0]; // Default if not found
    if (geoResponse.data.features.length > 0) 
    {
        coordinates = geoResponse.data.features[0].center; // Reverse to get [lat, lng]
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = {type:"Point",coordinates: coordinates};
    await newListing.save();
   
    req.flash("success","New Listing Created");
    res.redirect("/listings");
    }
    catch (error) {
        console.error("Geocoding error:", error);
        req.flash("error", "Error processing location");
        res.redirect("/listings/new");
    }
    
}

module.exports.renderEditForm = async(req,res)=>
{
        let {id} = req.params;
        const listing = await Listing.findById(id);
        if(!listing)
        {
            req.flash("error","Requested listing does not exists");
            return res.redirect("/listings");
        }
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250,c_fill");
        res.render("listings/edit.ejs",{ listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;    

    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }   
    
    // Handle image update
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    if (typeof req.body.listing.image === "string") {
        req.body.listing.image = { url: req.body.listing.image }; 
    }
    if(req.body.listing.location)
    {
        try {
            const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json?key=${MAP_TOKEN}`;
            const geoResponse = await axios.get(geoUrl);
            //console.log("Geocoding Response:", JSON.stringify(geoResponse.data, null, 2)); // Debugging
            if (geoResponse.data.features.length > 0) 
            {
                let geoData = geoResponse.data.features[0];

                listing.geometry.coordinates = geoData.center;
                listing.location = req.body.listing.location;     // Full formatted address

                // Extract country from context (if available)
                let country = geoData.context?.find(c => c.id.includes("country"));
                listing.country = country ? country.text : "Unknown"; // Store country separately

                await listing.save();
            } else {
                req.flash("error", "Could not update location, please enter a valid address.");
            }
        } catch (error) {
            //console.error("Geocoding API error:", error);
            req.flash("error", "Geocoding failed. Please try again.");
        }
    }
    await listing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res) => 
{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) 
    {
        req.flash("error", "Listing not found or already deleted");
        return res.redirect("/listings");
    }
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}