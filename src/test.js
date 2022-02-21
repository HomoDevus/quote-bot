import {
    books,
    getAllPagesLink
} from "./notion-interact.mjs";
import {updateAPI} from "./api-interact.mjs";

test()

async function test() {
    await getAllPagesLink()
    await updateAPI(books)
}