const { Telegraf, Markup } = require("telegraf");

// Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// The description about bot
const botDescription = "👋Hi, there! \n 👉This is Snipe Bot on Aptos Blockchain Network";

// Handle the start command
bot.command("start", async (ctx) => {
  ctx.reply(botDescription, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Hey", callback_data: "hey" }],
        [
          { text: "Wallets", callback_data: "wallets" },
          { text: "Create Wallet", callback_data: "create" },
          { text: "Import Wallet", callback_data: "import" },
          { text: "Delete Wallet", callback_data: "Hdeletei" },
        ],
      ],
    },
  });
});

// Handle the help command
bot.command("help", (ctx) => {
  ctx.reply(`
You can control me by sending these commands:\n\n/start - start the bot\n`);
});

// Handle unrecognized commands
bot.command((ctx) => {
  ctx.reply("Sorry, I don't recognize that command. Please use /help to see available commands.");
});

// Handle the text message
bot.on("text", (ctx) => {
  const command = ctx.message.text;

  // Check if the command is not recognized
  if (!command.startsWith("/")) {
    ctx.reply("I don't recognize that command. Please use /help to see available commands.");
  }
});

// Part to handle hey button event
bot.action("hey", (ctx) => ctx.reply("Hey, there!"));

// Part to handle importing wallet
bot.action("import", (ctx) => ctx.reply("Okay. Please input the wallet address."));

// Start the bot
bot.launch();
console.log("Bot is running...");
