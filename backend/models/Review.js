const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    maxlength: [500, 'Review cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Ensure one review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.getAverageRating = async function(bookId) {
  const obj = await this.aggregate([
    {
      $match: { book: bookId }
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Book').findByIdAndUpdate(bookId, {
      averageRating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      totalReviews: obj[0] ? obj[0].totalReviews : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Calculate average rating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.book);
});

// Calculate average rating after remove
reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.book);
});

module.exports = mongoose.model('Review', reviewSchema);