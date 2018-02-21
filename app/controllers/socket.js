
"use strict"
const chat = require('./chat');

exports = module.exports = function (io) {

  const clients = {};

  const escapeHtml = (text = "") => {
    return text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  };



  // Set socket.io listeners.
  io.on('connection', (client) => {
    const userID = client.handshake.query.id;
    console.log('a user connected ' + userID + ' with id ' + client.id);
    clients[userID] = client.id;


    client.on('sentMessage', (data) => {

      if (!data["body"] || data["body"] === "" || !data["conversationID"] || data["conversationID"] === "") return;

      client.join(data.conversationID);
      if (clients[data.toOpen[0]]) {
        // CONNECTED
        const socketDest = io.sockets.connected[clients[data.toOpen[0]]];
        if (!client.rooms[data.conversationID]) {
          client.join(data.conversationID);
        }
        if (socketDest && !socketDest.rooms[data.conversationID]) {
          socketDest.join(data.conversationID);
        }

        chat.reply(userID, data.conversationID, data.body, (message) => {
          client.broadcast.to(data.conversationID).emit('receivedMessage', data);
        })
      } else {
        // NOT CONNECTED
        chat.reply(userID, data.conversationID, data.body, () => { })

      }
    });


    client.on('disconnect', () => {
      delete clients[client.handshake.query.id];
      console.log('user disconnected');
    });

    // // On conversation entry, join broadcast channel
    // client.on('join', (data) => {
    //   client.join(data.frq);
    //   // console.log(data.frq);
    //   console.log(client.handshake.query.id + 'joined to' + data.frq);
    // });

    // client.on('create', (data) => {
    //   client.join(data.frq);
    //   if (clients[data.extuser]) {
    //     console.log(data.extuser);
    //     console.log(clients[data.extuser]);
    //     io.to(clients[data.extuser]).emit('add', data.frq);
    //   }

    // });

    // client.on('leave', (data) => {
    //   client.leave(data.frq);
    //   client.disconnect(true);
    //   console.log('left ' + data.frq);
    // })


    // client.on('send', (data) => {
    //   console.log('6');
    //   if (!data["msg"] || data["msg"] === "" || !data["frq"] || data["frq"] === "") return;

    //   //sanitize data
    //   data["frq"] = escapeHtml(data["frq"]).substring(0, 32);
    //   data["msg"] = escapeHtml(data["msg"]).substring(0, 512);


    //   client.join(data["frq"]);
    //   console.log(client.handshake.query.id + 'joined to' + data["frq"]);
    //   if (clients[data.data.recipient]) {
    //     console.log('7');
    //     io.to(clients[data.data.recipient]).emit('add', data["frq"]);
    //   }
    //   console.log('8');
    //   client.to(data.frq).emit('chat', data);
    // });

  });
}