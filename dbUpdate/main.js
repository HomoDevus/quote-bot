import {
    getAllPagesLink
} from "./notion-interact.mjs";
import {updateAPI} from "./api-interact.mjs";

export async function update() {
    let books = await getAllPagesLink()
    await updateAPI(books)
}