import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  name: String,
  soilTypes: [String],
  climates: [String],
  regions: [String],
  growthDurationDays: Number,
  festivalDemand: [String],
  baseMarketPrice: Number,
  demandLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
  fertilizers: [{ name: String, dosage: String, timing: String }],
  growingTips: [String],
}, { timestamps: true });

export default mongoose.model('CropRecommendation', cropSchema);