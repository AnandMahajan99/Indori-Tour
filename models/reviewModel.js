const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY SCHEMA - populate user and tour
reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name photo'
  //   }).populate({
  //     path: 'tour',
  //     select: 'name'
  //   });

  // only populate user
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this points to the current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  // this point to current review
  // this.constructor - this point to Review model (model is created after this - written below)
  this.constructor.calcAverageRatings(this.tour);
});

// findIdAndUpdate
// findIdAndDelete
// both queries internally use findOneAnd
reviewSchema.post(/^findOneAnd/, async function(docs, next) {
  // console.log('docs ', docs);
  if (!docs) return new AppError('This document does not exist', 404);
  await docs.constructor.calcAverageRatings(docs.tour);
  next();
});

// This two also work same as above
// reviewSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function() {
// this.findOne // does not work here query has already executed
//   this.r.constructor.calcAverageRatings(this.r.tour);
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
