import fetch from "node-fetch";
import {config} from "dotenv";
import { DEFAULT_PORT } from '../API/server.js';

config()

const URL = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? DEFAULT_PORT}`

export async function getReq(path, id = false) {
    if (id) {
        path += id.toString()
    }

    try {
        let res = await fetch(URL + path)
        let json = await res.json();
        return json
    } catch (e) {
        console.error("GET:", e)
    }
}

export async function postReq(path, data) {
    try {
        let res = await fetch(URL + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        let json = await res.json()
        return json
    } catch (e) {
        console.error("POST:", e)
    }
}

export async function deleteReq(path) {
    try {
        await fetch(URL + path, {method: 'delete'});
    } catch (e) {
        console.error('DELETE', e)
    }
}

export async function putReq(path, data) {
    try {
        let response = await fetch(URL + path, {
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