const User = require("../models/user.model");

/**
 * Middleware function to validate premium user status and account limits
 *
 * @param {Telegraf<Context<Update>>} ctx 
 * @param {() => Promise<void>} next
 * @returns
 */
const premiumValidate = async (ctx, next) => {
  // Extract the chat ID from the context (ctx)
  const chatId = ctx.chat.id;

  // Find the user in the database using their Telegram ID (tgId)
  const user = await User.findOne({ tgId: chatId });

  // Check if the user is not a premium member and has fewer than 3 accounts
  if (!user.premium && user.accounts.length < 3) {
    return next();
  }
  // Check if the user is a premium member and has fewer than 10 accounts
  else if (user.premium && user.accounts.length < 10) {
    return next();
  }
  // If neither condition is met, inform the user about account generation limits
  else {
    if (user.premium) ctx.reply("You can generate 10 wallets at most");
    else ctx.reply("Generating wallet is limited. Buy premium.");
  }
};

module.exports = { premiumValidate };
