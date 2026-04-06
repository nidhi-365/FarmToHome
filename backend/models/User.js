import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['farmer', 'customer'], default: 'farmer' },

  // Farmer-specific fields
  farmName: String,
  location: String,
  soilType: String,
  climate:  String,

  // Customer-specific fields
  phone: String,
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);