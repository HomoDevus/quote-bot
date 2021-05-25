let env = process.env
console.log('test', env)
const { Client } = require('@notionhq/client');
const dataBaseId = process.env.NOTION_DATABASE_ID;
const notion = new Client({ auth: process.env.NOTION_TOKEN });
let notes = [];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function getPage(pageId) {
    let pageAPI = {}
    pageAPI.sections = await notion.blocks.children.list({ block_id: pageId });
    pageAPI.header = await notion.pages.retrieve({ page_id: pageId });
    return pageAPI;
}

async function getDataBase(databaseId) {
    return await notion.databases.query({ database_id: databaseId })
}

async function getAllPagesLink() {
    let requests = [];
    let dataBase = await getDataBase(dataBaseId);
    for (let page of dataBase.results) {
        requests.push(getPage(page.id));
    }
    await Promise.all(requests)
        .then((result) => {
            for (let page of result) {
                for (let section of page.sections.results) {
                    if (section.paragraph.text.length === 0) continue;
                    let sectionText = '';
                    for (let textPart of section.paragraph.text) {
                        sectionText += textPart.plain_text
                    }
                    notes.push({
                        title: page.header.properties.Title.title[0].plain_text,
                        author: page.header.properties.Author.rich_text[0].plain_text,
                        quoteText: sectionText
                    });
                }
            }
        }
    )
}

module.exports.getQuote = async function getQuote() {
    await getAllPagesLink();
    let randomNum = getRandomInt(notes.length);
    return exports.note = notes[randomNum];
}