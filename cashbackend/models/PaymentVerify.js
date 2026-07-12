import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const paymentVerifySchema = new Schema(
  {
    toggle: { type: Boolean, default: false },
    counter: { type: Number, default: 0 },
    verifyCount: { type: Number, default: 10 },
    skipCount: { type: Number, default: 1 },
    lastTurnedOn: { type: Date },
  },
  { timestamps: true }
);

const PaymentVerify = mongoose.model('PaymentVerify', paymentVerifySchema);

export default PaymentVerify;
