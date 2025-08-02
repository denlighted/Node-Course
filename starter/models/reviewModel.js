const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require("./../models/tourModels");
const reviewSchema = new mongoose.Schema({
  review:{
    type: String,
    minlength: 3,
    maxlength:300,
    required:[true, "Review cannot be empty "],
  },
  rating:{
    type:Number,
    required:[true, "A tour must have a rating"],
    min:1,
    max:5
  },
  createdAt:{
    type: Date,
    required:[true, "A tour must have a date"],
    default: Date.now(),
  },
  tour:{
    type: mongoose.Schema.ObjectId,
    ref:"Tour",
    required:[true, "Review must have a tour"],

  },
  user:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
    required:[true, "Review must have a user"],
  }
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});

reviewSchema.index({tour:1, user:1},{unique:true})

reviewSchema.pre(/^find/,function(next){
  this.populate({
    path: 'user',
    select:"name photo"
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId){

  const stats= await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group:{
        _id:'tour',
        nRatings:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    }
  ]);
  console.log(stats);

  if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantity:stats[0].nRatings ,
      ratingsAverage: stats[0].avgRating
    });
  }
  else{
    await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantity:0 ,
      ratingsAverage: 4.5
    });
  }

};

reviewSchema.post('save',function(doc){
  // this points to current review
  this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next){
  this.r = await this.clone().findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function(doc){
  await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;


