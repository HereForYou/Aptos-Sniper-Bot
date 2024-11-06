let time;

const start = (ctx) => {
  console.log("running...");
  time = setInterval(() => {
    ctx.reply("Sniping...");
  }, 5000);
};

const pause = (ctx) => {
  clearInterval(time);
  ctx.reply("Sniping is paused.");
};

module.exports = {
  start,
  pause,
};
