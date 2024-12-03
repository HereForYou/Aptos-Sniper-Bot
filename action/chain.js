const { Context } = require("telegraf");
const { chainsMarkUp } = require("../models/markup.model");
const { chainsText } = require("../models/text.model");

/**
 * When user clicks the 'Chains' callback button on first page
 *
 * @param {Context} ctx
 */
const actionChains = (ctx) => {
  try {
    ctx.reply(chainsText, chainsMarkUp);
    ctx.session.previousCommand = "Chains";
  } catch (error) {
    console.error(error);
  }
};

/**
 * When user clicks the 'Close' callback button on Chains page
 *
 * @param {Context} ctx
 */
const actionClose = (ctx) => {
  try {
    ctx.deleteMessage();
  } catch (error) {
    console.error(error);
  }
};

module.exports = { actionChains, actionClose };
