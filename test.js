const proxy = require('./index');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const randomstring = require("randomstring");

// テスト用 proxy先サーバ
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const session_key = "dummy_session_cookie_key";
var sessions = {};


app.post("/login", (req, res) => {
    var key = randomstring.generate();

    sessions[key] = req.body;
    res.cookie(session_key, key);

    console.log("create session " + key);

    res.status(200).send({status:"success"})
})

app.all('/items', (req, res) => {
    var key = req.cookies[session_key];
    res.status(200).send(sessions[key]);
});

app.listen(3001);

// proxy開始
proxy({
    port: 3000,
    dest: "http://localhost:3001"
});

