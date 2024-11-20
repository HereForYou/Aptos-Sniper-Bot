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
      // symbol: String,
      totalUsedAptosAmount: Number,
      totalUsedAptosAmountUSD: Number,
      totalBoughtTokenAmount: Number,
      totalBoughtTokenAmountUSD: Number,
      accountAddress: String,
      // totalBuyedTokenPrice: Number,
      initialBuyDate: {
        type: Date,
      },
      latestBuyDate: {
        type: Date,
        default: () => Date.now(),
      },
      initialSellDate: {
        type: Date,
      },
      latestSellDate: {
        type: Date,
        default: () => Date.now(),
      },
    },
  ],
  snipes: [],
  premium: {
    type: Boolean,
    default: false,
  },
});

const User = model("User", UserSchema, "user");

module.exports = User;
