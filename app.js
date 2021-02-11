// ------------------------- IMPORTS -----------------------------------------
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');

//-------------------------- ADD FUNCTIONALITY TO APP ------------------------

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//--------------------------- GLOBAL MIDDLEWARE (Apply for each and every request) ---------------------
// Note - All the middleware execute in stack

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Logging information to console in development
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try after some time.'
});
app.use('/api', limiter);

// Body parser, used to get data in req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data Sanitization against Mongo query injection
app.use(mongoSanitize());

// Data Sanitization against XSS (Cross-side-scrypting)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'difficulty', 'ratingsAverage', 'maxGroupSize']
  })
);

// app.use((req, res, next) => {
//   console.log('Hello from the Middleware');
//   next(); // Call next middleware in the stack
// });

app.use((req, res, n) => {
  req.reqTime = new Date().toString();
  n();
});

/*

//------------------------- READING FILE --------------------------------------

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//----------------------- ROUTE HANDLER ------------------------------------------

const getAllTours = (req, res) => {                   //   (req, res) => {} = route handler
    console.log(req.reqTime);
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
}

const getTour = (req, res) => {                 // :param1/:param2/:param3?      ? = for optional param

    // console.log(req.params);
    const id = Number(req.params.id);                      // req.params.id * 1
    const tour = tours.find(el => el.id === id);

    //if(id > tours.length)
    if (!tour) {
        return res.status(404).json({
            status: 'failed',
            message: 'Inavlid Id'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
}

const createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({                         // status = 201  resource is created 
            status: "sucess",
            data: {
                newTour
            }
        });
    });
}

const updateTour = (req, res) => {

    if (!(tours.find(el => el.id === req.params.id * 1))) {
        return res.status(404).json({
            status: 'failed',
            message: 'Inavlid Id'
        });
    }

    res.status(200).json({
        status: "success",
        data: {
            tour: "Updated Tour"
        }
    });
}

const deleteTour = (req, res) => {

    if (!(tours.find(el => el.id === req.params.id * 1))) {
        return res.status(404).json({
            status: 'failed',
            message: 'Inavlid Id'
        });
    }

    res.status(204).json({                   // status = 204  no content
        status: "success",
        data: null
    });
}

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'Failed',
        message: 'This route is not defined yet';
    });
}

const createUser = (req, res) => {
    res.status(500).json({
        status: 'Failed',
        message: 'This route is not defined yet';
    });
}
const getUser = (req, res) => {
    res.status(500).json({
        status: 'Failed',
        message: 'This route is not defined yet';
    });
}
const updateUser = (req, res) => {
    res.status(500).json({
        status: 'Failed',
        message: 'This route is not defined yet';
    });
}
const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'Failed',
        message: 'This route is not defined yet';
    });
}

*/

// ------------------- ROUTES (Middleware for specific route) -------------------------------------

// app.get('/api/v1/tours', getAllTours);                         //      /api/v1/tours = route,
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// app
//     .route('/api/v1/tours')
//     .get(getAllTours).post(createTour);

/*

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter
    .route('/')
    .get(getAllTours).post(createTour);

tourRouter
    .route('/:id')
    .get(getTour).patch(updateTour)
    .delete(deleteTour);

userRouter
    .route('/')
    .get(getAllUsers)
    .post(createUser);

userRouter
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

*/

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// .all() for all requests get, post, put, patch..
// * for any url route
app.all('*', (req, res, next) => {
  //   res.status(404).json({
  //     status: 'failed',
  //     message: `The url ${req.originalUrl} does'nt exist`
  //   });

  //   const err = new Error(`The url ${req.originalUrl} does'nt exist`);
  //   err.statusCode = 404;
  //   err.status = 'failed';

  next(new AppError(`The url ${req.originalUrl} does'nt exist`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
