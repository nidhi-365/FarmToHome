import mongoose from 'mongoose';

const produceSchema = new mongoose.Schema({
  farmer:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true },
  category:       { type: String, required: true },
  quantity:       { type: Number, required: true },
  unit:           { type: String, default: 'kg' },
  price:          { type: Number, required: true },
  suggestedPrice: Number,
  imageUrl:       String,
  quality:        { type: String, enum: ['Standard', 'Imperfect'], default: 'Standard' },
  shelfLife:      String,
  season:         { type: String, enum: ['Summer', 'Winter', 'Monsoon', 'All Season'] },
  disaster:       { type: Boolean, default: false }, 
  isListed:       { type: Boolean, default: true },
  isImperfect:    { type: Boolean, default: false },
  description:    String,
  sold:           { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Produce', produceSchema);