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
        { text: "Return", callback_data: "AutoSnipe" },
      ],
      [{ text: "Add Snipe", callback_data: "AddSnipe" }],
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
      [{ text: "Return", callback_data: "Return" }],
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
          { text: "Connect Wallet", callback_data: "ConnectWallet" },
          { text: "Disconnect Wallet", callback_data: "DisconnectWallet" },
          { text: "Return", callback_data: "Wallets" },
        ],
        [
          { text: "Generate Wallet", callback_data: "GenerateWallet" },
          { text: "Multi-Wallet (soon)", callback_data: "MultiWallet" },
          { text: "Active Wallet", callback_data: "ActiveWallet" },
        ],
        [
          { text: "APTOS (soon)", callback_data: "APTOS" },
          { text: "Tokens (soon)", callback_data: "Tokens" },
        ],
        [{ text: "Balance (soon)", callback_data: "Balance" }],
        [
          { text: "Buy KB (soon)", callback_data: "Buy KB" },
          { text: "Config (soon)", callback_data: "Config" },
          { text: !flag ? "Export" : "Hide", callback_data: "Export" },
        ],
      ],
    },
  };
};

const callChannelMarkUp = {
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

const autoSnipeMarkUp = {
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
        { text: "Pause", callback_data: "pause" },
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
};
