const { Schema, model } = require("mongoose");
const UserSchema = new Schema({
  tgId: {
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
  snipes: [],
});

const User = model("User", UserSchema, "user");

module.exports = User;
