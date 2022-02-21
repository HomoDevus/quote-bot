import jsonServer from 'json-server'
import {update} from "../src/main.js";

const server = jsonServer.create()
const router = jsonServer.router('API/db.json', {})
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(async function (req, res, next) {
  if (req.originalUrl === '/update') {
    await update()
  }
  next()
})
server.use(router)
server.use(jsonServer.rewriter('API/routes.json'))
server.listen(process.env.PORT || 8000, () => {
  console.log('JSON Server is running')
})