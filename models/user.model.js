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
  tokens: [],
  snipes: [],
});

const User = model("User", UserSchema, "user");

module.exports = User;
