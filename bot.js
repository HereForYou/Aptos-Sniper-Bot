const { Telegraf, session } = require("telegraf");
const { isValidWallet, removeTags } = require("./utils/function");
const { createAccount, deriveAccount } = require("./utils/aptos-web3");
const { start, pause } = require("./utils/snipe");

//========================================================= Create new bot -> username: @aptos_snipe_bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
const wallets = []; //=========================== variable to save all wallets
const accounts = []; //========================== variable to save all accounts
const tokens = []; //============================ variable to save all tokens
let isSnipeRunning = false; //=================== variable to save whether or not bot is running
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
        { text: "Add Token", callback_data: "add" },
        { text: "Your Tokens", callback_data: "tokens" },
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

//============================================================================= Handle the help command
bot.command("help", (ctx) => {
  ctx.reply(`You can control me by sending these commands:\n\n/start - start the bot\n`);
});

//============================================================================= Handle unrecognized commands
bot.command((ctx) => {
  ctx.reply("⚠️ Sorry, I don't recognize that command.\nPlease use /help to see the available commands.");
});

//=====================================================================================================|
//                            The part to listen the messages from bot                                 |
//=====================================================================================================|

//============================================================================== Handle the text message
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  //========================================================= The part to handle wallet will be imported
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
    chatId = ctx.chat.id;
    startMessage = await ctx.reply(
      "<b>address</b> : <code>" +
        account.address +
        "</code>\n<b>privateKey</b> : <code>" +
        account.privateKey +
        "</code>\n<b>publicKey</b> : <code>" +
        account.publicKey +
        "</code>",
      { parse_mode: "HTML", reply_markup: markUp.reply_markup }
    );
    ctx.session.previousCommand = "";
    //======================================================= The part to handle deleting wallet
  } else if (ctx.session.previousCommand === "delete") {
    const index = wallets.indexOf(text);
    if (index === -1) {
      ctx.reply("⚠️ There is no such wallet.\nPlease check again the wallet is existed.");
      return;
    }
    wallets.splice(index, 1);
    chatId = ctx.chat.id;
    startMessage = await ctx.reply("✅ Successfully deleted", markUp);
    ctx.session.previousCommand = "";
    //======================================================= The part to handle adding new token
  } else if (ctx.session.previousCommand === "add") {
    // If the the token address is invalid
    if (!isValidWallet(text)) {
      ctx.reply("⚠️ Invalid token address! Please input the valid token address.");
      return;
    }

    tokens.push(text);
    chatId = ctx.chat.id;
    startMessage = await ctx.reply("✅ Successfully added", markUp);
  } else {
    if (text.startsWith("/"))
      ctx.reply("⚠️ I don't recognize that command.\nPlease use /help to see available commands.");
  }
});

//=====================================================================================================|
//                             The part to declare the actions                                         |
//=====================================================================================================|

//============================================================================== When the user clicks the wallets button
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

//===================================================================== When the user clicks the import button
bot.action("import", (ctx) => {
  ctx.reply("Okay. Please input the private key of your wallet you want to import.");
  ctx.session.previousCommand = "import";
});

//===================================================================== When the user clicks the delete button
bot.action("delete", (ctx) => {
  if (wallets.length === 0) {
    ctx.reply("⚠️ There is no wallet!");
    return;
  }
  ctx.reply("Okay. Please input the wallet address you want to delete.");
  ctx.session.previousCommand = "delete";
});

//===================================================================== When the user clicks the create button
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

//============================================================================== When the user clicks the your tokens button
bot.action("tokens", async (ctx) => {
  let replyMessage = "";
  try {
    if (tokens.length === 0) {
      replyMessage = "⚠️ There is no tokens";
    } else {
      replyMessage = "These are your tokens.\n<code>" + tokens.join("</code>\n<code>") + "</code>";
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

//===================================================================== When the user clicks the add token button
bot.action("add", (ctx) => {
  ctx.reply("Okay. Please input the token address you want to add.");
  ctx.session.previousCommand = "add";
});

bot.action("start", (ctx) => {
  if (isSnipeRunning) {
    ctx.reply("🚫 Sorry, snipe is already started.");
    return;
  }
  if (tokens.length === 0 || wallets.length === 0) {
    ctx.reply("🚫 Sorry, there is no token or wallet for swapping.");
    return;
  }
  console.log(tokens[0]);

  start(ctx, tokens[0], "0x1::aptos_coin::AptosCoin", 1, wallets[0]);
  isSnipeRunning = true;
  ctx.reply("Snipe is running...");
});

bot.action("pause", (ctx) => {
  if (!isSnipeRunning) {
    ctx.reply("Snipe does not get started.");
    return;
  }
  pause();
  isSnipeRunning = false;
  ctx.reply("Snipe is paused.");
});

const commands = [
  { command: "/start", description: "Start Aptos Snipe Bot" },
  { command: "/help", description: "Show all available commands" },
];
bot.telegram.setMyCommands(commands);

//===================================================================== Launch the bot
bot.launch();
console.log("Bot is running...");
