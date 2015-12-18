const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const uuid = require('uuid');
const url = require('url');

var cookie_store = {} // {uuid: cookies}

module.exports = (options) => {
    serverStart(options.port, options.dest);
};

function isNewSessionRequest(req){
    return req.headers["x-login-create"];
}

function isExistSession(req){
    const uuid = req.headers["x-login-uuid"];
    return uuid && cookie_store[uuid];
}

function proxyParameter(req, dest){
    const path = url.parse(req.url).path;

    var headers = {};

    for(var key in req.headers){
        if( key == 'host' || key == 'x-login-uuid') { continue; }
        headers[key] = req.headers[key];
    }

    return {
        method: req.method,
        url: dest + path,
        headers: headers,
        body: JSON.stringify(req.body)
    };
}

function getStoredCookie(req){
    const uuid = req.headers["x-login-uuid"];
    return cookie_store[uuid];
}


function serverStart(port, dest){
    
    var app = express();
    app.use(bodyParser.json());


    app.all("*", (req, res) => {

        if (isNewSessionRequest(req)){

            var params = proxyParameter(req, dest);
            var j = request.jar();
            params.jar = j;

            request(params, (error, _res, body) => {
                if (error){
                    console.error(error);
                    res.status(500).send({"error": "proxy error"});
                    return;
                }

                for(var key in _res.headers){
                    if( key == 'host' || key == 'set-cookie') { continue; }
                    res.setHeader(key, _res.headers[key])
                }                

                const session_uuid = uuid.v4();
                cookie_store[session_uuid] = j.getCookieString(params.url);
                res.setHeader("X-Multi-Login-UUID", session_uuid);
 
                res.status(200).send(body);
            });

        } else if (isExistSession(req)) {

            var params = proxyParameter(req, dest);
            params.headers.cookie = getStoredCookie(req)

            request(params, (error, _res, body) => {
                if (error){
                    console.error(error);
                    res.status(500).send({"error": "proxy error"});
                    return;
                }

                for(var key in _res.headers){
                    if( key == 'host' || key == 'set-cookie') { continue; }
                    res.setHeader(key, _res.headers[key])
                }                

                res.status(_res.statusCode).send(body);
            });

        } else {
            res.status(400).send("invalid request");
        }
    });

    app.listen(port, function(){
        console.log("proxy start: " + port + " : -> " + dest);
    });
}