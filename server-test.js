const axios = require("axios");
const fetch = require("node-fetch");

const URL = 'http://localhost:8000/books/1'
let book = {
    author: "ABC",
    title: "Title",
    notes: [{quoteText: "ABC", id: 1, notesId: 1},{quoteText: "note number 2", id: 2, notesId: 2}, {quoteText: "note number 3", id: 3, notesId: 3}]
}

// let note = {quoteText: "Test", id: 2}

updateAPI()

async function updateAPI() {
    await getReq();
    // await deleteReq()
    // await postReq(book)
    // await getReq();
}

async function getReq() {
    try {
        let res = await fetch(URL)
        let json = await res.json();
        console.log("GET:", json)
    } catch (e) {
        console.error("GET:", e)
    }
}

async function postReq(data) {
    try {
        let res = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        let json = await res.json()
        console.log("POST:", JSON.stringify(json))
    } catch (e) {
        console.error("POST:", e)
    }
}

async function deleteReq() {
    try {
        await fetch(URL, {method: 'delete'});
    } catch (e) {
        console.error('DELETE', e)
    }
    // try {
    // let req = await axios.delete(URL)
    //     console.log("DELETE:", req.data)
    // } catch (e) {
    //     console.error("DELETE", e)
    // }
}

async function putReq(data, id) {
    try {
        let response = await fetch(URL + id, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
        let json = await response.json()
        console.log("PUT:", json)
    } catch(e) {
        console.error('PUT:', e)
    }
}