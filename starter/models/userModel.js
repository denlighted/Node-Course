const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userShema = new mongoose.Schema({
  name:{
    type:String,
    required:[true, "The User must to have a name"],
    maxLength:[50,"A user name has to be less or equal then 40 characters "],
  },
  email:{
    type:String,
    required:[true, "A User must be a valid email address"],
    unique:true,
    lowercase:true,
    validate:[validator.isEmail, "Please provide a valid email address"]
  },
  photo:{
    type: String,
    default:'default.jpg'
  },
  role:{
    type:String,
    enum:['user','admin','guide','lead-guide'],
    default: 'user',
  },
  password:{
    type:String,
    required:[true, "A user must be a valid password"],
    minLength:[8,"A password  has to be more or equal then 8 characters "],
    select:false
  },
  passwordConfirm:{
    type: String,
    required:[true, "A user must have a confirm password"],
    validate:{
      //This only works on CREATE and SAVE!!!
      validator: function(el){
        return this.password === el;
      },
      message:`The confirmation value: ({VALUE} does not match with the original password)`
    }
  },
  passwordChangedAt: Date,
  passwordResetToken:String,
  passwordResetExpires:Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }
});

userShema.pre('save', async function  (next){
  //Only run this function if password was actually modified

  if(!this.isModified('password')){
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);

  // delete password confirm field
  this.passwordConfirm = undefined;

  next();
});

userShema.pre(/^find/,function(next){
  this.find({active:{$ne:false}})
  next();
})

userShema.pre('save',function(next){
  if(!this.isModified('password'||this.isNew())){
    return next();
  }
  this.passwordChangedAt = Date.now()-1000;
  next();
})

userShema.methods.correctPassword = async function(candidatePassword, userPassword){
  return await bcrypt.compare(candidatePassword,userPassword);
}

userShema.methods.changedPasswordAfter = function(JWTTimestamp){
  if(this.passwordChangedAt){
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);

    return JWTTimestamp< changedTimestamp; // 100 < 200
  }
  //False means not changed
  return false
}

userShema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 *1000

  console.log(`${resetToken}`, this.passwordResetToken)

  return resetToken;
};

const User = mongoose.model("User", userShema);

module.exports = User;