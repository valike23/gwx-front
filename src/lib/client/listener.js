import { browser } from "$app/environment";
import dayjs from "dayjs";
import { db } from "./db";
import { numId } from "./helpers";

async function processData(arg) {

    // save the notification
    db.collection("notifications").put(Object.assign(
        {},
        arg,
        { 
            _id: arg._id || arg.tag || numId(),
            timestamp: arg.timestamp || dayjs().valueOf()
        }
    ));

}

export function listenForMessages() {

    if (browser || ('BroadcastChannel' in self)) {
        const bc = new BroadcastChannel("gwx_channel");

        bc.addEventListener("message", event => {
            try {
                const data = event.data;
                if (typeof data == "object") {
                    processData(data);
                }
            } catch (error) {
                console.log(error);
            }
        })
    }

    if (browser && ('serviceWorker' in navigator)) {
        navigator.serviceWorker.onmessage = (event) => {
            try {
                const data = event.data;
                if (typeof data == "object") {
                    processData(data);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

}