const { chainsMarkUp } = require("../models/markup.model");
const { chainsText } = require("../models/text.model");

const actionChains = (ctx) => {
  try {
    ctx.reply(chainsText, chainsMarkUp);
    ctx.session.previousCommand = "Chains";
  } catch (error) {
    console.error(error);
  }
};

const actionClose = (ctx) => {
  try {
    ctx.deleteMessage();
  } catch (error) {
    console.error(error);
  }
};

module.exports = { actionChains, actionClose };
