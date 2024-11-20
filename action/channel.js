const { callChannelMarkUp } = require("../models/markup.model");

const actionChannel = async (ctx) => {
  try {
    await ctx.editMessageText("Select target chain:", callChannelMarkUp);
    ctx.session.previousCommand = "Channel";
  } catch (error) {
    console.error(error);
  }
};

module.exports = { actionChannel };
