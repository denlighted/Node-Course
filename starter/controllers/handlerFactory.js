const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModels');
const appError = require('../utils/appError');
const APIFEATURES = require('../utils/apifeatures');


exports.deleteOne = Model =>catchAsync( async function(req, res,next){
  const doc = await Model.findByIdAndDelete(req.params.id)

  if(!doc){
    return next(new appError("The document with this ID does not exist!", 404));
  }

  res.status(200).json({
    status:"success",
    data:null

  });
});

exports.updateOne = Model => catchAsync(async function(req,res,next){
  const doc= await Model.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  })

  if(!doc){
    return next(new appError("The document with this ID does not exist!", 404));
  }

  res.status(200).json({
    status:'success',
    data:{
      data: doc
    }
  })
});

exports.createOne = Model => catchAsync( async function  (req, res,next)  {
  const newDoc  = await Model.create(req.body);

  res.status(201).json({
    status:"success",
    data:{
      data: newDoc
    }
  });
});

exports.getOne = (Model,populateOptions)=>catchAsync( async function(req, res,next) {
  let query = Model.findById(req.params.id);
  if(populateOptions) query = query.populate(populateOptions)

  const doc = await query;

  if(!doc){
    return next(new appError("The document with this ID does not exist!", 404));
  }

  res.status(200).json({
    status:"success",
    data:{
      data: doc
    }
  })
});

exports.getAll = Model =>catchAsync( async function(req,res,next){
  // To allow for nested get reviews on tour (hack)
  let filter = {};
  if(req.params.tourId) filter = { tour:req.params.tourId }


  const features = new APIFEATURES(Model.find(filter),req.query).filter().sorting().limiting().pagination();
  const doc = await features.query


  res.status(200).json({
    status:"success",
    results:doc.length,
    data:{
      data: doc
    }
  });
});



