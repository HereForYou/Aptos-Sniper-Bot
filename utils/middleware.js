const User = require("../models/user.model");

const premiumValidate = async (ctx, next) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ tgId: chatId });
  if (!user.premium && user.accounts.length < 3) {
    return next();
  } else if (user.premium && user.accounts.length < 10) {
    return next();
  } else {
    ctx.reply("Generating wallet is limited. Buy premium.");
  }
};

const tryCatchHandler = (fn) => (ctx) => {
  try {
    fn(ctx);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { premiumValidate, tryCatchHandler };
