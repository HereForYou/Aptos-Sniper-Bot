const { Telegraf, Markup, session } = require("telegraf");
const { isValidWallet } = require("./utils/function");
const { createWallet, createAccount, deriveAccount } = require("./utils/aptos-web3");
const { createCipheriv } = require("crypto");

// Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;
const wallets = [];
const accounts = [];

bot.use(session());
bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = {};
  }
  return next();
});

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
          { text: "Delete Wallet", callback_data: "delete" },
        ],
      ],
    },
  });
});

// Handle the help command
bot.command("help", (ctx) => {
  ctx.reply(`You can control me by sending these commands:\n\n/start - start the bot\n`);
});

// Handle unrecognized commands
bot.command((ctx) => {
  ctx.reply("⚠️ Sorry, I don't recognize that command.\nPlease use /help to see the available commands.");
});

// Handle the text message
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  // The part to handle the imported wallet
  if (ctx.session.previousCommand === "import") {
    // If the wallet is invalid
    if (!isValidWallet(text)) {
      ctx.reply("⚠️ Invalid private key! Please input the valid private key.");
      return;
    }

    const account = await deriveAccount(text);
    if (account.error) {
      console.log("🚫 Something went wrong while deriving account using privateKey:", error);
      ctx.reply("🚫 Something went wrong while deriving account using privateKey.");
      return;
    }

    accounts.push(account);
    wallets.push(account.address);
    console.log("wallets: ", wallets);
    ctx.reply(
      "<b>address</b>: " +
        account.address +
        "\n<b>privateKey</b>: " +
        account.privateKey +
        "\n<b>publicKey</b>: " +
        account.publicKey,
      { parse_mode: "HTML" }
    );
    ctx.session.previousCommand = "";
  } else if (ctx.session.previousCommand === "delete") {
    const index = wallets.indexOf(text);
    if (index === -1) {
      ctx.reply("⚠️ There is no such wallet.\nPlease check again the wallet is existed.");
      return;
    }
    wallets.splice(index, 1);
    ctx.reply("✅ Successfully deleted");
    ctx.session.previousCommand = "";
  } else {
    if (text.startsWith("/"))
      ctx.reply("⚠️ I don't recognize that command.\nPlease use /help to see available commands.");
  }
});

// Part to handle hey button event
bot.action("hey", (ctx) => ctx.reply("Hey, there!"));

// Part to get all wallets
bot.action("wallets", (ctx) => {
  if (wallets.length === 0) {
    ctx.reply("⚠️ There is no wallet");
  } else {
    ctx.reply(wallets.join("\n"));
    ctx.session.previousCommand = "import";
  }
});

// Part to handle importing wallet
bot.action("import", (ctx) => {
  ctx.reply("Okay. Please input the private key of your wallet.");
  ctx.session.previousCommand = "import";
});

// Part to handle deleting wallet
bot.action("delete", (ctx) => {
  if (wallets.length === 0) {
    ctx.reply("⚠️ There is no wallet!");
    return;
  }
  ctx.reply("Okay. Please input the wallet address you want to delete.");
  ctx.session.previousCommand = "delete";
});

// Part to handle creating wallet
bot.action("create", async (ctx) => {
  const account = await createAccount();
  if (account.error) {
    console.log(error);
    ctx.reply("🚫 Something went wrong while creating account.");
    return;
  }

  accounts.push(account);
  wallets.push(account.address);
  ctx.reply(
    "<b>address</b>: " +
      account.address +
      "\n<b>privateKey</b>: " +
      account.privateKey +
      "\n<b>publicKey</b>: " +
      account.publicKey,
    { parse_mode: "HTML" }
  );
});

// Start the bot
bot.launch();
console.log("Bot is running...");
