const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js"); 

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: {
      type: String,
      required: true,
      default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    },
    filename: {
      type: String,
      required: true
    },
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be positive"]
  },
 
  location: 
  {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Trending",
      "Rooms",
      "Iconic Cities",
      "Mountains",
      "Castles",
      "Amazon Pools",
      "Arctic",
      "Camping",
      "Farms",
      "Domes",
      "Boats"
    ]
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  geometry :{
    type: { type: String,enum: ["Point"], required: true,default: "Point"},
    coordinates: { type: [Number],required: true,  default: [0, 0] }
  }
});
listingSchema.index({ geometry: "2dsphere" }); 
// Middleware to delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    try {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
    } catch (error) {
      console.error("Error deleting associated reviews:", error);
    }
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
