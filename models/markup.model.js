const mainMarkUp = {
  reply_markup: {
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
          { text: "Activate", callback_data: "ActiveWallet" },
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

const markUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "ziptos" }],
      [{ text: "⚙️ Chains", callback_data: "chains" }],
      [
        { text: "⚙️ Wallets", callback_data: "wallets" },
        { text: "⚙️ Call Channels", callback_data: "Channel" },
      ],
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
        { text: "Pause", callback_data: "Pause" },
      ],
    ],
  },
};

module.exports = {
  mainMarkUp,
  chainsMarkUp,
  markUp,
  walletsMarkUp,
  callChannelMarkUp,
  autoSnipeMarkUp,
  manageSnipeMarkUp,
  genConWalletMarkUp,
  manageWalletMarkUp,
  addSnipeMarkUp,
  autoSnipeConfMarkUp,
};
