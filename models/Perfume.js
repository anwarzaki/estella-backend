import mongoose from 'mongoose';

const perfumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter perfume name'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please enter brand name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please enter price'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please enter category'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Please enter stock'],
    min: 0
  },
  imgSrc: {
    type: String,
    required: [true, 'Please provide an image']
  },
  description: {
    type: String,
    trim: true
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

 const Perfume = mongoose.model('Perfume', perfumeSchema);

 export default Perfume;