const mainMarkUp = {
  reply_markup: {
    parse_mode: "HTML",
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [{ text: "🌐 Chains", callback_data: "Chains" }],
      [
        { text: "💰 Wallets", callback_data: "Wallets" },
        { text: "⚙️ Call Channels", callback_data: "Channel" },
      ],
      [
        { text: "⚙️ Presales (soon)", callback_data: "Presales" },
        { text: "⚙️ Copytrade (soon)", callback_data: "CopyTrade" },
      ],
      [
        { text: "🎯 Auto Snipe", callback_data: "AutoSnipe" },
        { text: "📡 Signals (soon)", callback_data: "Signals" },
      ],
      [
        { text: "🌉 Bridge (soon)", callback_data: "Bridge" },
        { text: "🌟 Premium (soon)", callback_data: "Premium" },
        { text: "⁉️ FAQ (soon)", callback_data: "FAQ" },
      ],
    ],
  },
};

const autoSnipeConfMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [
        { text: "⚙️ Add Token", callback_data: "AddToken" },
        { text: "⚙️ Remove Token", callback_data: "RemoveToken" },
      ],
      [{ text: "Return", callback_data: "APTOS" }],
    ],
  },
};

const walletsMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [{ text: "Return", callback_data: "Return" }],
      [
        { text: "APTOS", callback_data: "APTOS" },
        { text: "MOVEMENT (soon)", callback_data: "MOVEMENT" },
      ],
    ],
  },
};

const manageSnipeMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [
        { text: "⚙️ Config", callback_data: "Config" },
        { text: "Add Snipe", callback_data: "AddSnipe" },
      ],
      [{ text: "Return", callback_data: "AutoSnipe" }],
    ],
  },
};

const addSnipeMarkUp = {
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Start", callback_data: "Start" },
        { text: "Pause", callback_data: "Pause" },
      ],
      [{ text: "Return", callback_data: "APTOS" }],
    ],
  },
};

const genConWalletMarkUp = (returnCallback) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
        [
          { text: "Connect Wallet", callback_data: "ConnectWallet" },
          { text: "Return", callback_data: returnCallback },
        ],
        [{ text: "Generate Wallet", callback_data: "GenerateWallet" }],
      ],
    },
  };
};

const manageWalletMarkUp = (flag) => {
  return {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
        [
          { text: "Import", callback_data: "ConnectWallet" },
          { text: "Disconnect", callback_data: "DisconnectWallet" },
          { text: !flag ? "Export" : "Hide", callback_data: "Export" },
        ],
        [
          { text: "Generate Wallet", callback_data: "GenerateWallet" },
          //   { text: "Multi-Wallet (soon)", callback_data: "MultiWallet" },
          { text: "Activate", callback_data: "ActivateWallet" },
          { text: "Deactivate", callback_data: "DeactivateWallet" },
        ],
        // [
        //   { text: "APTOS (soon)", callback_data: "APTOS" },
        //   { text: "Tokens (soon)", callback_data: "Tokens" },
        // ],
        // [{ text: "Balance (soon)", callback_data: "Balance" }],
        [
          //   { text: "Buy KB (soon)", callback_data: "Buy KB" },
          //   { text: "⚙️ Config (soon)", callback_data: "Config" },
          { text: "Return", callback_data: "Wallets" },
        ],
      ],
    },
  };
};

/**
 *
 * @param {Array} accounts
 * @returns
 */
const selectWalletForBuyMarkUp = (accounts) => {
  let markUps = [];
  for (let i = 0; i < Math.ceil(accounts.length / 3); i++) {
    markUps.push([]);
  }
  return {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
        [
          ...accounts.map((account, index) => {
            return { text: `Wallet${index + 1}`, callback_data: `Wallet ${index}` };
          }),
        ],
        // accounts.map((element, index) => {
        //   markUps[index / 3].push({ text: `Wallet${index + 1}`, callback_data: `Wallet ${index}` });
        //   if (index === accounts.length) {
        //     return ...markUps;
        //   }
        // }),
        [{ text: "Wallet All", callback_data: "Wallet All" }],
      ],
    },
  };
};

const callChannelMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [
        { text: "APTOS", callback_data: "APTOS" },
        { text: "MOVEMENT (soon)", callback_data: "MOVEMENT" },
      ],
      [{ text: "Return", callback_data: "Return" }],
    ],
  },
};

const autoSnipeMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [
        { text: "APTOS", callback_data: "APTOS" },
        { text: "MOVEMENT (soon)", callback_data: "MOVEMENT" },
      ],
      [{ text: "Return", callback_data: "Return" }],
    ],
  },
};

const chainsMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [
        { text: "🔴 APTOS", callback_data: "APTOS" },
        { text: "🟢 MOVEMENT (soon)", callback_data: "MOVEMENT" },
      ],
      [{ text: "🔻 Generate or connect a wallet 🔻", callback_data: "ControlWallet" }],
      [
        { text: "⚙️ APTOS", callback_data: "APTOS" },
        { text: "⚙️ MOVEMENT (soon)", callback_data: "MOVEMENT" },
      ],
      [
        { text: "🔄 Refresh (soon)", callback_data: "Refresh" },
        { text: "❌ Close", callback_data: "Close" },
      ],
    ],
  },
};

const buySuccessReplyMarkUp = {
  //🔁
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Ziptos", callback_data: "Ziptos" },
        { text: "Sniper Bot", callback_data: "Ziptos" },
      ],
      [
        { text: "25%", callback_data: "Sell 25%" },
        { text: "50%", callback_data: "Sell 50%" },
        { text: "75%", callback_data: "Sell 75%" },
        { text: "100%", callback_data: "Sell 100%" },
      ],
      [
        { text: "Sell Initials", callback_data: "Sell Initials" },
        { text: "Sell", callback_data: "Sell" },
        { text: "Sell X %", callback_data: "Sell X %" },
      ],
      [
        { text: "Sell X APT", callback_data: "Sell X APT" },
        { text: "Sell Max TX", callback_data: "Sell Max Tx" },
        { text: "Sell X Tokens", callback_data: "Sell X Tokens" },
      ],
      [
        { text: "🔄 Reset", callback_data: "Reset" },
        { text: "🟢 Refresh", callback_data: "Refresh" },
        { text: "🔴 Stop", callback_data: "Stop" },
        { text: "❌ Delete", callback_data: "Close" },
      ],
    ],
  },
};

const buyTokenMarkUp = {
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Ziptos", callback_data: "Ziptos" },
        { text: "Sniper Bot", callback_data: "Ziptos" },
      ],
      [{ text: "Buy ↔️ Sell", callback_data: "BuySell" }],
      [
        { text: "Buy 0.1 APT", callback_data: "Buy0.1APT" },
        { text: "Buy 0.2 APT", callback_data: "Buy0.2APT" },
      ],
      [
        { text: "Buy 0.5 APT", callback_data: "Buy0.5APT" },
        { text: "Buy 1 APT", callback_data: "Buy1APT" },
      ],
      [
        { text: "Buy 2 APT", callback_data: "Buy2APT" },
        { text: "Buy 5 APT", callback_data: "Buy5APT" },
      ],
      [
        { text: "Buy X APT", callback_data: "BuyXAPT" },
        // { text: "Buy 0.1 APT", callback_data: "Buy0.1APT" },
      ],
    ],
  },
};

const sellTokenMarkUp = {
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Ziptos", callback_data: "Ziptos" },
        { text: "Sniper Bot", callback_data: "Ziptos" },
      ],
      [{ text: "Buy ↔️ Sell", callback_data: "BuySell" }],
      [
        { text: "25%", callback_data: "Sell 25%" },
        { text: "50%", callback_data: "Sell 50%" },
        { text: "75%", callback_data: "Sell 75%" },
        { text: "100%", callback_data: "Sell 100%" },
      ],
      [
        { text: "Sell X %", callback_data: "Sell X %" },
      ],
      [
        { text: "Sell X APT", callback_data: "Sell X APT" },
        { text: "Sell Max TX", callback_data: "Sell Max Tx" },
        { text: "Sell X Tokens", callback_data: "Sell X Tokens" },
      ],
    ],
  },
};

module.exports = {
  mainMarkUp,
  chainsMarkUp,
  walletsMarkUp,
  callChannelMarkUp,
  autoSnipeMarkUp,
  manageSnipeMarkUp,
  genConWalletMarkUp,
  manageWalletMarkUp,
  selectWalletForBuyMarkUp,
  addSnipeMarkUp,
  autoSnipeConfMarkUp,
  buySuccessReplyMarkUp,
  buyTokenMarkUp,
  sellTokenMarkUp,
};
