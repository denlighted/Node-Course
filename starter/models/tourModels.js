const mongoose = require('mongoose');
//const validator = require('validator')
const slugify = require('slugify');
//const User = require('./../models/userModel');

const toursSchema = new mongoose.Schema({
  name:{
    type: String,
    required:[true, "A tour must have a name"],
    unique:true,
    maxLength:[40,"A tour name has to be less or equal then 40 characters "],
    minLength:[10,"A tour name has to be more or equal then 10 characters "],
   // validate:[validator.isAlpha, "Tour name must only contain characters"]
  },

  slug:String,

  duration:{
    type: Number,
    required:[true, "A tour must have a duration"],
  },

  maxGroupSize:{
    type: Number,
    required:[true, "A tour must have a max group size"],
  },

  difficulty:{
    type:String,
    required:[true, "A tour must have a difficulty"],
    enum:{
      values: ["easy","medium","difficult"],
      message:"Difficulty is either: easy, medium, difficult"
    }
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
    min:[1,"Rating must be above 1 "],
    max:[5,"Rating must be below 5"],
    set:val =>Math.round(val*10)/10
  },

  ratingsQuantity:{
    type: Number,
    default:0
  },

  price:{
    type: Number,
    required:[true, "A tour must have a price"],
  },

  discount: {
    type: Number,
    validate: {
      validator: function(val) {
        // this only points to current doc on NEW document creation
        return this.price >= val
      },
      message: "Discount cannot ({VALUE}) be greater than price"    },
  },
  summary:{
    type: String,
    trim:true
  },

  description:{
    type: String,
    trim:true
  },

  imageCover:{
    type: String,
    required:[true, "A tour must have a cover image"]
  },

  images:{
    type:[String],
    createdAt:{
      type: Date,
      default: Date.now()
    },
  },

 startDates:{
    type:[Date]
 },
 secretTour:{
    type:Boolean,
    default:false
 },
  startLocation:{
    //GeoJSON
    type:{
      type:String,
      default:'Point',
      enum:["Point"]
    },
    coordinates:[Number],
    address:String,
    description:String
  },
  locations:[
    {
      type:{
        type:String,
        default:'Point',
        enum:["Point"]
      },
      coordinates:[Number],
      address:String,
      description:"String",
      day:Number
    }
  ],
  guides:[
    {type:mongoose.Schema.ObjectId,
    ref:"User"
    },
  ],
},
  {toJSON:{virtuals:true},
  toObject:{virtuals:true}}
);

toursSchema.index({price:1, ratingsAverage:-1});
toursSchema.index({slug:1});
toursSchema.index({startLocation:'2dsphere'})


toursSchema.virtual('durationWeeks').get(function(){
  return this.duration/7
});

//Virtual Populate
toursSchema.virtual('reviews',{
  ref:"Review",
  foreignField:'tour',
  localField:"_id"
});

//Document middleware Run before .save() and .create() command
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {lower:true});
  next();
})

toursSchema.pre('save', function (next) {
 // console.log("Will save document");
  next();
});

toursSchema.pre(/^find/,function(next){
  this.populate({
    path: 'guides',
    select:'-__v -passwordChangedAt'
  });
  next();
})

toursSchema.pre('save',async function(next){
  const guidesPromises= this.guides.map(async id=>User.findById(id));
  this.guides =  await Promise.all(guidesPromises);
  next();
})

toursSchema.post('save',function(doc,next){
  //console.log(doc);
  next();
});

//Query Middleware
toursSchema.pre(/^find/, function (next) {
  this.find({secretTour:{$ne:true}})
  this.start = Date.now();
  next();
})

// toursSchema.post(/^find/, function (docs,next) {
// console.log(`Query took ${(Date.now() - this.start)} miliseconds`)
//   next();
// })

//Aggregation Middleware
 toursSchema.pre('aggregate',function(next){
   this.pipeline().unshift({
     $match:{secretTour:{$ne:true}}
   })
   console.log(this.pipeline())
   next();
 })

const Tour = mongoose.model("Tour",toursSchema);

module.exports = Tour;