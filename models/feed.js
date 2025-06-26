import mongoose from 'mongoose';

const feedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxLength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['men','women', 'unisex']
  },
  imgSrc: {
    type: String,
    required: [true, 'Please add an image']
  }
}, {
  timestamps: true
});

export const Feed = mongoose.model('Feed', feedSchema);
