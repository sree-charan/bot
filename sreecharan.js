//How to run  node -r esm sreecharan.js
import { WAConnection } from '@adiwajshing/baileys'
import { MessageType } from '@adiwajshing/baileys'
import * as fs from "fs"

//OpenAI API
const OpenAI = require('openai-api');
//Input output nodeJS 
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Load your key from an environment variable or secret management service
// (do not include your key directly in your code)
//const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

//OpenAI-api key
const openai = new OpenAI("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");

//Asyncronously run the function 
async function fun(query) {
    const Response = await openai.complete({
        engine: 'davinci',
        prompt: query,
        temperature: 0.3,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });
    let sendingMsg = Response.data.choices[0].text
    let trimmedMsg = sendingMsg.trim()
    console.log(trimmedMsg)
    return trimmedMsg
        //console.log(Response.data.choices[0].text);
};



async function connectToWhatsApp() {
    const conn = new WAConnection()
    if (!fs.existsSync("./auth_info.txt")) { //Show QR
        conn.connectOptions.maxRetries = 5;
        conn.on('qr', async(qr) => {
            console.log("Scan the QR code above")
        })
        await conn.connect();
        var sass = JSON.stringify(conn.base64EncodedAuthInfo());
        var stringSession = Buffer.from(sass).toString('base64');
        console.log("Your string session ->", stringSession)
        fs.writeFileSync('./auth_info.txt', stringSession)
    } else { //Saved
        console.log("Session exists")
        fs.readFile("./auth_info.txt", 'utf8', function(err, data) {
            var dec = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
            console.log(dec)
            conn.loadAuthInfo(dec)
            conn.connect()
        })
    }
    conn.on('chat-update', async chat => {
        if (!chat.hasNewMessage) return
        if (!chat.messages) return
        let fromMe = true
        chat = chat.messages.all()[0]
        console.log(chat)
        if (chat.key.fromMe) return
        var sender = chat.key.remoteJid;
        console.log(sender)
            //if we want to ignore in groups
            // if (sender.endsWith("@g.us")) return 
        try {
            console.log("checking message, received :", chat.message.conversation)
            console.log(chat.key.id)
            let msg = chat.message.conversation
            if (msg.charAt(0) == 'Q' && msg.charAt(1) == ' ') {
                let result = msg.substring(2)
                let resu = await fun(result)
                let arr = resu.split("\n")
                let repeatmsg = [...new Set(arr)]
                console.log(repeatmsg)
                    //if (chat.message.conversation == "Hai") {
                const sentMsg = await conn.sendMessage(sender, repeatmsg[0], MessageType.extendedText, { quoted: chat })
                    //    console.log(sentMsg)
                    //}
            }

        } catch (err) {
            console.log(err)
            console.log("Catched Exception")

        }
        // message conversation
        // message extendedTextMessage text || contextInfo quotedMessage

    })
}
connectToWhatsApp()
    .catch(err => console.log("unexpected error: " + err)) // catch any errors