import jsonServer from 'json-server'
import {update} from "../dbUpdate/main.js";
import {botKill, botStart} from "../telegramBot/botControl.mjs";

const server = jsonServer.create()
const router = jsonServer.router('src/API/db.json', {})
const middlewares = jsonServer.defaults()

const PORT = process.env.PORT || 7000

server.use(middlewares)
server.use(async function (req, res, next) {
  if (req.originalUrl === '/update') {
    await update()
    res.sendStatus(200)
  } else if (req.originalUrl === '/bot-start') {
    await botStart()
    res.sendStatus(200)
  } else if (req.originalUrl === '/bot-kill') {
    await botKill()
    res.sendStatus(200)
  } else {
    next()
  }
})
server.use(router)
server.use(jsonServer.rewriter('API/routes.json'))
server.listen(PORT, async () => {
  console.log('JSON Server is running on port:', PORT)
  await botStart()
})
