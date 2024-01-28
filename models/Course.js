const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({

   courseTitle: {
    type: String,
    trim: true,
    
   },
   courseDescription: {
    type:String,
    trim:true
   },

   instructor: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true,
 
   },
   whatYouWillLearn: {
    type:String,
    required: true,
    trim: true,
   },
   courseContent: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Section"
   }],
   ratingAndReview:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReview"
    }
   ],
   price: {
    type: Number,

   },
   thumbnail: {
    type:String,
   },
   category: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Category",
   
   },
   studentEnrolled:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true,
   
   }],
   tags:{
    type: [String],
    required: true,
    trim: true,
    
   },
   instructions: {
    type: [String],
   },
   status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
   },
   createdAt: {
    type:Date,
    default:Date.now,
   }


});

module.exports = mongoose.model("Course",courseSchema);