/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Setup web server and socket
var twitter = require('twitter'),
        express = require('express'),
        app = express(),
        http = require('http'),
        server = http.createServer(app),
        io = require('socket.io').listen(server);



//Setup twitter stream api
var twit = new twitter({
    consumer_key: 'AXEnkS6KJx1npTGHlnW48AYni',
    consumer_secret: 'ioPAY9QdPz3RiZrOW4j7rcJgFPtIE3R8yTzJfeMjPdM4xB9ayN',
    access_token_key: '219305489-gmjZufg24ARdTLMVk23WTPEVOwnOD4w6x2D7XRdo',
    access_token_secret: 'VLTgSqBdTG1eNaKXVFTbIXqmKcg7NWoLbeI4MEsnQBiFq'
}),
        stream = null;

//Use the default port
server.listen(process.env.PORT || 8081);

//Setup rotuing for app
app.use(express.static(__dirname + '/public'));



//Create web sockets connection.
io.sockets.on('connection', function (socket) {

    socket.on("start tweets", function () {

        if (stream === null) {
            //Connect to twitter stream passing in filter for entire world.
            twit.stream('statuses/filter', {track: 'happy birthday' ,language: 'en'}, function (stream) {
                stream.on('data', function (data) {

                    // Does the JSON result have coordinates
                    if (data.coordinates) {
                        if (data.coordinates !== null) {
                            console.log(data);
                            console.log(data.coordinates);
                            console.log("===============================================");
                            //If so then build up some nice json and send out to web sockets
                            var outputPoint = {"lat": data.coordinates.coordinates[0], "lng": data.coordinates.coordinates[1],"tweet":data.text,"profile":data.user.profile_image_url};
                            var tweet=data.text;
                            var profile=data.user.profile_image_url;
                            socket.broadcast.emit("twitter-stream", outputPoint);
                            socket.broadcast.emit("tweet",tweet);
                            socket.broadcast.emit("profile",profile);
                            //Send out to web sockets channel.
                            socket.emit('twitter-stream', outputPoint);
                            socket.emit("tweet",tweet);
                            socket.emit("profile",profile);
                        }

                    }

                });
                stream.on('limit', function (limitMessage) {
                    return console.log(limitMessage);
                });

                stream.on('warning', function (warning) {
                    return console.log(warning);
                });

                stream.on('disconnect', function (disconnectMessage) {
                    return console.log(disconnectMessage);
                });
            });
        }
    });

    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
    socket.emit("connected");
    console.log("connected");
});

