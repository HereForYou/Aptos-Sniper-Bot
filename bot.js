const { Telegraf, session } = require("telegraf");
const { isValidWallet, removeTags } = require("./utils/function");
const { createAccount, deriveAccount } = require("./utils/aptos-web3");
const { start, pause } = require("./utils/snipe");

//========================================================= Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const wallets = []; //=========================== variable to save all wallets
const accounts = []; //========================== variable to save all accounts
let startMessage, chatId; //===================== variable to handle editing the initial message

bot.use(session());
bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = {};
  }
  return next();
});

//============================================================================= The description about bot
const botDescription = "👋Hi, there! \n 👉This is Snipe Bot on Aptos Blockchain Network";
const markUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Wallets", callback_data: "wallets" }],
      [
        { text: "Create Wallet", callback_data: "create" },
        { text: "Import Wallet", callback_data: "import" },
        { text: "Delete Wallet", callback_data: "delete" },
      ],
      [
        { text: "Start", callback_data: "start" },
        { text: "Pause", callback_data: "pause" },
      ],
    ],
  },
};

//=====================================================================================================|
//                                 The part to declare the commands                                    |
//=====================================================================================================|

//============================================================================= Handle the start command
bot.command("start", async (ctx) => {
  chatId = ctx.chat.id;
  console.log(chatId);
  startMessage = await ctx.reply(botDescription, markUp);
});

// Handle the help command
bot.command("help", (ctx) => {
  ctx.reply(`You can control me by sending these commands:\n\n/start - start the bot\n`);
});

// Handle unrecognized commands
bot.command((ctx) => {
  ctx.reply("⚠️ Sorry, I don't recognize that command.\nPlease use /help to see the available commands.");
});

//=====================================================================================================|
//                            The part to listen the messages from bot                                 |
//=====================================================================================================|

//============================================================================== Handle the text message
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
      "<b>address</b> : " +
        account.address +
        "\n<b>privateKey</b> : " +
        account.privateKey +
        "\n<b>publicKey</b> : " +
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

//=====================================================================================================|
//                             The part to declare the actions                                         |
//=====================================================================================================|

//============================================================================== Part to get all wallets
bot.action("wallets", async (ctx) => {
  let replyMessage = "";
  try {
    if (wallets.length === 0) {
      replyMessage = "⚠️ There is no wallet";
    } else {
      replyMessage = "These are your wallets.\n<code>" + wallets.join("</code>\n<code>") + "</code>";
    }

    if (!startMessage) {
      chatId = ctx.chat.id;
      startMessage = await ctx.reply(replyMessage, { parse_mode: "HTML", reply_markup: markUp.reply_markup });
      return;
    }

    if (removeTags(replyMessage) === removeTags(startMessage.text)) {
      return;
    }

    startMessage = await ctx.telegram.editMessageText(chatId, startMessage.message_id, undefined, replyMessage, {
      parse_mode: "HTML",
      reply_markup: markUp.reply_markup,
    });
  } catch (error) {
    console.log(error, startMessage);
    ctx.reply("🚫 Sorry, something went wrong while sending message.\n Please restart the bot.");
  }
});

//===================================================================== Part to handle importing wallet
bot.action("import", (ctx) => {
  ctx.reply("Okay. Please input the private key of your wallet you want to import.");
  ctx.session.previousCommand = "import";
});

//===================================================================== Part to handle deleting wallet
bot.action("delete", (ctx) => {
  if (wallets.length === 0) {
    ctx.reply("⚠️ There is no wallet!");
    return;
  }
  ctx.reply("Okay. Please input the wallet address you want to delete.");
  ctx.session.previousCommand = "delete";
});

//===================================================================== Part to handle creating wallet
bot.action("create", async (ctx) => {
  let replyMessage = "";
  try {
    const account = await createAccount(); // create new account
    if (account.error) {
      //===== if there is some errors
      replyMessage = "🚫 Sorry, Something went wrong while creating account.";
    } else {
      accounts.push(account);
      wallets.push(account.address);
      replyMessage =
        "Done! New wallet is created.\n" +
        "<b>address</b> : <code>" +
        account.address +
        "</code>\n<b>privateKey</b> : <code>" +
        account.privateKey +
        "</code>\n<b>publicKey</b> : <code>" +
        account.publicKey +
        "</code>";
    }

    if (!startMessage) {
      chatId = ctx.chat.id;
      startMessage = await ctx.reply(replyMessage, { parse_mode: "HTML", reply_markup: markUp.reply_markup });
      return;
    }

    if (removeTags(replyMessage) === removeTags(startMessage.text)) {
      return;
    }

    await ctx.telegram.editMessageText(chatId, startMessage.message_id, undefined, replyMessage, {
      parse_mode: "HTML",
      reply_markup: markUp.reply_markup,
    });
  } catch (error) {
    console.log(error);
    ctx.reply("🚫 Sorry, something went wrong while sending message.\nPlease restart the bot.");
  }
});

bot.action("start", (ctx) => {
  ctx.reply("Sniping is started...");
  //   start(ctx);
});

bot.action("pause", (ctx) => {
  ctx.reply("Sniping is paused.");
  //   pause(ctx);
});

//===================================================================== Launch the bot
bot.launch();
console.log("Bot is running...");
