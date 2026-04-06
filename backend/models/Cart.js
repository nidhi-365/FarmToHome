import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  produce:    { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
  name:       { type: String, required: true },
  imageUrl:   { type: String, default: '' },
  price:      { type: Number, required: true },
  unit:       { type: String, default: 'kg' },
  quantity:   { type: Number, required: true, min: 1, default: 1 },
  farmerName: { type: String, default: '' },
  farmerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export default mongoose.model('Cart', cartSchema);
