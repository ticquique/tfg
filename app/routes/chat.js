
var chatController = require('../controllers/chat');

module.exports = function (router) {
    'use strict';
    // This will handle the url calls for /countries/:country_id
    router.route('/')
        .get(chatController.getConversations);

    router.route('/:conversationId')
        .get(chatController.getConversation)
        .post(chatController.sendReply);

    router.route('/new/:recipient')
        .post(chatController.newConversation)
        .get(chatController.newConversation);

};