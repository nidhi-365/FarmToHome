import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  produce:    { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
  name:       { type: String, required: true },
  imageUrl:   { type: String, default: '' },
  price:      { type: Number, required: true },
  unit:       { type: String, default: 'kg' },
  quantity:   { type: Number, required: true, min: 1 },
  farmerName: { type: String, default: '' },
  farmerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street:  { type: String },
      city:    { type: String, default: 'Bengaluru' },
      state:   { type: String, default: 'Karnataka' },
      pincode: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
