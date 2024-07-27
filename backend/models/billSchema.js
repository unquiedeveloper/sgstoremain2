import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        productname: { type: String },
        price: { type: String }
      }
    ],
    totalAmount: { type: Number, required: true },
    couponAmount: { type: Number },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Cash", "Paytm"],
     
    },
  });
  
  export const Bill = mongoose.model('Bill', billSchema);
  