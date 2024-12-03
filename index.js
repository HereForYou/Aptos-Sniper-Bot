const { Telegraf } = require("telegraf");
require("dotenv").config({});

const bot = require("./bot");
const { connectDB } = require("./config/db");

connectDB();
