const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./starter/routes/tourRoutes.js');
const userRouter = require('./starter/routes/userRoutes');
const reviewRouter = require('./starter/routes/reviewRoutes');
const viewRouter = require('./starter/routes/viewRoutes');
const bookingRouter = require('./starter/routes/bookingRoutes');
const globalErrorHandler = require('./starter/controllers/errorController');
const appError = require('./starter/utils/appError');
const path  = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();

app.use(express.static(path.join(__dirname, 'starter', 'public')));


app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  })
);

// Start Express App

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max:100,
    window:60*60*1000,
    message:"Too many request from this IP, please try again in an hour"
});

app.use('/api',limiter);
app.use(cookieParser())
app.use(express.urlencoded({
  extended:true,
  limit:'10kb'
}))

app.use(express.json({limit:'10kb'}));
app.use(hpp({
    whitelist:[
      'duration',
      'ratingsQuantity',
      'ratingAverage',
      'difficulty',
      'price',
      'maxGroupSize'
    ]
}));
app.use(compression());

app.use(mongoSanitize());
app.use(xss());


app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next()
})





app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter)

app.all("*",(req,res,next)=>{
    next(new appError(`Cannot find an original url ${req.originalUrl}`,404));
});

app.use(globalErrorHandler);


module.exports = app;


