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
        { text: "⚙️ Presales", callback_data: "Presales" },
        { text: "⚙️ Copytrade", callback_data: "CopyTrade" },
      ],
      [
        { text: "🎯 Auto Snipe", callback_data: "AutoSnipe" },
        { text: "📡 Signals", callback_data: "Signals" },
      ],
      [
        { text: "🌉 Bridge", callback_data: "Bridge" },
        { text: "🌟 Premium", callback_data: "Premium" },
        { text: "⁉️ FAQ", callback_data: "FAQ" },
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
        { text: "MOVEMENT", callback_data: "MOVEMENT" },
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

const manageWalletMarkUp = (returnCallback) => {
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

const callChannelMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [{ text: "Return", callback_data: "Return" }],
      [
        { text: "APTOS", callback_data: "APTOS" },
        { text: "MOVEMENT", callback_data: "MOVEMENT" },
      ],
    ],
  },
};

const autoSnipeMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [{ text: "Return", callback_data: "Return" }],
      [{ text: "APTOS", callback_data: "APTOS" }],
    ],
  },
};

const chainsMarkUp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Ziptos Sniper Bot", callback_data: "Ziptos" }],
      [
        { text: "🔴 APTOS", callback_data: "APTOS" },
        { text: "🟢 MOVEMENT", callback_data: "MOVEMENT" },
      ],
      [{ text: "🔻 Generate or connect a wallet 🔻", callback_data: "ControlWallet" }],
      [
        { text: "⚙️ APTOS", callback_data: "APTOS" },
        { text: "⚙️ MOVEMENT", callback_data: "MOVEMENT" },
      ],
      [
        { text: "🔄 Refresh", callback_data: "Refresh" },
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
  manageWalletMarkUp,
  addSnipeMarkUp,
};
