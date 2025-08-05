const Tour = require("./../models/tourModels");
const User = require("./../models/userModel");
const Booking = require("./../models/bookingModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");


exports.getOverview = catchAsync ( async (req,res,next)=>{
  // 1 Get tour data from the collection
  const tours = await Tour.find();

  // 2 Build Template
  //3 Rending that template using tour data from 1)
  res.status(200).render('overview',{
    title: "All Tours",
    tours
  });
});

exports.getTour = catchAsync (async (req,res,next)=>{
  const tour = await Tour.findOne({slug:req.params.slug}).populate({path: 'reviews', fields:'review rating user' });
  if(!tour){
    return next(new appError("There is no tour in collection with this name",404));
  }
  res.status(200).render('tour',{
    title: tour.name,
    tour
  })
});

exports.getLoginForm = catchAsync(async (req,res)=>{

  res.status(200).render('login',{
    title: "Log into your account"
  });
})

exports.getAccount = (req,res)=>{
  res.status(200).render('account',{
    title: "Log into your account",
    user:req.user
  })
}

exports.updateUserData = catchAsync (async (req,res,next)=>{
  const {name,email} = req.body;
  const updatedUser =  await User.findByIdAndUpdate(req.user.id,{name:name, email:email},{
    new:true,
    runValidators:true
  });

  res.status(200).render('account',{
    title: "Log into your account",
    user:updatedUser
  })
});

exports.getMyTours = catchAsync (async (req,res,next)=>{
  // 1 Find all bookings
  const bookings = await Booking.find({ user: req.user.id })

  // 2 Find tours with the returned ID's
  const tourIDs = bookings.map(el=>el.tour);
  const tours = await Tour.find({_id:{$in:tourIDs}})

  res.status(200).render('overview',{
    title:"My Tours",
    tours,
    user:req.user.id

  })
});