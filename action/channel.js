const { Context } = require("telegraf");
const { callChannelMarkUp } = require("../models/markup.model");

/**
 * When user clicks the 'Channel' callback button on first page.
 *
 * @param {Context} ctx
 */
const actionChannel = async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", callChannelMarkUp);
    ctx.session.previousCommand = "Channel";
  } catch (error) {
    console.error(error);
  }
};

module.exports = { actionChannel };
