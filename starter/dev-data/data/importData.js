const mongoose = require('mongoose');

const path = require('path');

const fs = require('fs');

const Tour = require("./../../models/tourModels");
const User = require("./../../models/userModel");
const Review = require("./../../models/reviewModel");


const DB = 'mongodb+srv://morrantt:fwlkpyknlAQi3TMj@natours.oowwi.mongodb.net/?retryWrites=true&w=majority&appName=natours'

mongoose.connect(DB)
  .then(() => console.log("DB connected successfully!"))
  .catch(err => console.error("DB connection error:", err));

const tours = JSON.parse(fs.readFileSync(path.join(__dirname, `./tours.json`),'utf-8'));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, `./users.json`),'utf-8'));
const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, `./reviews.json`),'utf-8'));

const importData = async function(req,res){
  try{
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave:false});
    await Review.create(reviews);
    console.log("Data successfully loaded")
  }
  catch(err){
    console.log(err);
  }
    process.exit();
};

const deleteDate = async function(){
  try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data has been successfully deleted");
  }
  catch (err){
    console.log(err.message);
  }
    process.exit();
}

if(process.argv[2] === '--import'){
  importData();
}
else if (process.argv[2] ==="--delete"){
  deleteDate();
}

console.log(process.argv);
