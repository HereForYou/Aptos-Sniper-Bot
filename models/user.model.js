const { Schema, model } = require("mongoose");
const UserSchema = new Schema({
  tgId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  accounts: [
    {
      accountAddress: String,
      privateKey: String,
      publicKey: String,
      active: {
        type: Boolean,
        default: false,
      },
    },
  ],
  tokens: [
    {
      address: String,
      symbol: String,
      totalUsedAptosAmount: Number,
      totalUsedAptosWithFee: Number,
      totalUsedAptosAmountUSD: Number,
      totalBoughtTokenAmount: { type: Number, default: 0 },
      totalSoldTokenAmount: { type: Number, default: 0 },
      totalBoughtTokenAmountUSD: Number,
      accountAddress: String,
      averageBoughtPrice: Number,
      initialBuyDate: { type: Date },
      latestBuyDate: { type: Date, default: () => Date.now() },
    },
  ],
  snipes: [],
  premium: { type: Boolean, default: false },
});

const User = model("User", UserSchema, "user");

module.exports = User;
