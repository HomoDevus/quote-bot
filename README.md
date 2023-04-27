# Quote Bot DataBase
This is server that manages database for quote bot. Allows to store quote data in database instead of making 
request to Notion each time.

## API endpoints:

``/bot-start`` - 
start telegram bot that will listen for your commands.
<br>
You can see available bot commands below.

``/bot-update`` - fetch data from Notion and update database.

``/boot-kill`` - stop telegram bot.

## Telegram bot commands

``test`` - test that bot is running. It will send you test message.

``update`` - update database. Do this after adding notes n=to notion.
## Environment variables

### Required

``BOT_TOKEN`` - Telegram bot token.

``CHAT_ID`` - Telegram chat id.

``NOTION_DATABASE_ID`` - ID of notions database with quotes.

``NOTION-TOKEN`` - Notion token to use its API.

``API_URL`` - URL of server with database.

### Optional

``PORT`` - Port for the server. By default, port 8000 will be used.
