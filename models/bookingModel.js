const moongose = require('mongoose');

const bookingSchema = new moongose.Schema({
  tour: {
    type: moongose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong  to a Tour!']
  },
  user: {
    type: moongose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong  to a User!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
});

const Booking = moongose.Model('Booking', bookingSchema);

module.exports = Booking;
