const User = require("./../models/userModel");
const appError = require('../utils/appError');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const factory  =   require('./../controllers/handlerFactory');
const multer = require('multer');

exports.getAllUsers = factory.getAll(User);

/*const multerStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'starter/public/img/users')
    },
    filename:(req,file,cb)=>{
        // user-52525252dedav-343424343.jpeg
        const extension = file.mimetype.split('/')[1]
        cb(null,`user-${req.user.id}-${Date.now()}.${extension}`)
    }
});*/

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }
    else{
    cb(new appError("Not an image, please upload only image",400),false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync( async (req,res,next)=>{
    if(!req.file){
       return next();
    }
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500,500)
      .toFormat('jpeg')
      .jpeg({quality:90})
      .toFile(`starter/public/img/users/${req.file.filename}`);
    next();
});

const filterObj = (obj,...allowedFields)=>{
    const newObject= {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)){
            newObject[el] = obj[el];
        }
    });
    return newObject;
}

exports.updateMe = catchAsync( async function(req,res,next){

    // 1 Create the error if user trying  update the password
    if(req.body.password||req.body.passwordConfirm){
        return next(new appError("This route is not for password updates. Please user /updateMyPassword",400));
    }
    // 2 Update the user document
    const filteredBody = filterObj(req.body,'name','email');
    if(req.file) filteredBody.photo = req.file.filename

    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });

    res.status(200).json({
        status:"success",
        data:{
            user: updatedUser
        }

    })
});

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
}

exports.deleteMe = catchAsync  (async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(204).json({
        status:'success',
        data:null
    });
});
exports.createUser =function(req,res){
    res.status(500).json({
        status:"error",
        message:"This route is not yet defined! Please use /signup instead "
    })
}
exports.getUserbyId =factory.getOne(User);
//Do not update passwords with this !!
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);