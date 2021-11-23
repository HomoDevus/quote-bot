const { Telegraf } = require('telegraf') // import telegram lib
let { getQuote } = require('./notion-interact');

const bot = new Telegraf(process.env.BOT_TOKEN) // get the token from envirement variable
const chatId = process.env.CHAT_ID

function toEscapeMSg(str) {
  return str
      .replace(/_/gi, "\\_")
      .replace(/-/gi, "\\-")
      .replace("~", "\\~")
      .replace(/`/gi, "\\`")
      .replace(/\./g, "\\.")
      .replace(/\)/gi, "\\)")
      .replace(/\(/gi, "\\(")
      .replace(/!/gi, "\\!");
}

module.exports.run = async (event, context) => {
  let quote = await getQuote();
  await bot.telegram.sendMessage(chatId,
      `*${toEscapeMSg(quote.title)}* \\- _${toEscapeMSg(quote.author)}_\n\n${toEscapeMSg(quote.quoteText)}`,
      { parse_mode: "MarkdownV2" })
};