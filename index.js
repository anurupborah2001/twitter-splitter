/**
 * Twitter Splitter Node JS Script
 * @category  Twitter Splitter Service Script
 * @author Anurup Borah<anurupborah2001@gmail.com>
 * @version 1.0
 */


/**
 * 
 * @type Module express|Module express
 */
var express = require('express');

var app = express();
/**
 * 
 * @type Module http
 */
var http = require('http').Server(app);
/**
 * 
 * @type Module Body Parser
*/
var bodyParser = require('body-parser');
/**
 * 
 * @type Module socket|Module socket
 */
var io = require('socket.io')(http);
/**
 * 
 * @type Module config|Module config
 */
var config = require('./config');
/**
 * 
 * @type Module redis|Module redis
 */
var redis = require('redis'),client = redis.createClient(process.env.REDISPORT,process.env.HOST);
/**
 * 
 * @type Module socket|Module socket IO redis
 */
var redisAdapter = require('socket.io-redis');
//var engine = require('consolidate');

io.adapter(redisAdapter({ host: process.env.HOST, port: process.env.REDISPORT}));


var chatIo = io.of('/chat');
var port = process.env.PORT || 8080;
//app.set('views', __dirname + '/');
////app.engine('html', engine.mustache);
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Start the Server
http.listen(port, function() {
    console.log('Server Started. Listening on *:' + port);
});

/**
 * Render index.html file
*/
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

/**
 * Render chat.html file
*/
app.get('/chat', function (req, res) {
    res.sendFile(__dirname + '/chat.html');
});

/**
* Get The hostory of messages
*/
app.get('/get-message', function (req, res) {
    var messages = client.lrange('messages', 0, 99, function(err, reply) {
        if(!err) {
            var result = [];
            // Loop through the list, parsing each item into an object
            for(var msg in reply) result.push(JSON.parse(reply[msg]));
            // Pass the message list to the view
            res.send({ messages : result });
        }else{
            res.send("error retrieving orders");
        }
    });
});

/**
 * 
 * set teh static content path
 */
app.use(express.static(__dirname + '/public'));
/**
 * Set Port 
 */
app.set('port', config.PORT);
/**
 * Set Body parser Encoded
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
* Socket Connection
*/
io.on('connection', function(socket){
    /**
    * Socket Join Room
    */
  socket.join('TwitterRoom');
  
   /**
    * Socket Get message ab store it in Redis
    */
  socket.on('message', function(msg){
      //console.log('message : ' + msg);
      socket.to('TwitterRoom').emit('message', msg);
      client.lpush('messages', JSON.stringify(msg));
      client.ltrim('messages', 0, 99);      
      socket.emit('message', msg);//if need to broadcast to all the users    
   });
   
   /**
    * Socket Join Room By Username
    */
    socket.on('join', function(username) {
        // Attach the user's nickname to the socket
        socket.username = username;
        socket.emit('notice', username + ' has joined the chat.');
    });
   
   /**
    * Socket Disconnect the User and delete the message history
    */
    socket.once('disconnectuser', function(msg) {
        client.del('messages', function(err, response) {
            if (response == 1) {
               console.log("Deleted Successfully!")
            } else{
                console.log("Cannot delete")
            }
         })
        socket.emit('notice', socket.username + ' has left the chat.');
    });
});