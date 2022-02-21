import {Telegraf} from "telegraf";
import {getAllPagesLink} from "../dbUpdate/notion-interact.mjs";
import {updateAPI} from "../dbUpdate/api-interact.mjs"; // import telegram lib

const bot = new Telegraf(process.env.BOT_TOKEN) // get the token from envirement variable
const chatId = process.env.CHAT_ID

export async function botStart() {
    bot.command('test', async () => {
        await bot.telegram.sendMessage(chatId, 'test')
    })

    bot.command('update', async () => {
        let books = await getAllPagesLink()
        await updateAPI(books)
        await bot.telegram.sendMessage(chatId, 'Book notes were updated 🗃')
        await bot.telegram.sendMessage(chatId, `You have ${books.length} uploaded books 📚`)
    })

    bot.launch()
}

export async function botKill() {
    await bot.stop()
}