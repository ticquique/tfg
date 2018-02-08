"use strict"
const Conversation = require('../models/conversation'),
    Message = require('../models/message'),
    User = require('../models/user');

exports.getConversations = function (req, res, next) {
    // Only return one message from each conversation to display as snippet
    Conversation.find({ participants: req.user.id })
        .sort('-updatedAt')
        .exec(function (err, conversations) {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            if (conversations && conversations.length === 0) {
                return res.status(200).json({ message: "No conversations yet" });
            }

            // Set up empty array to hold conversations + most recent message
            let fullConversations = [];
            let conversationsNotOpened = 0;
            conversations.forEach(function (conversation) {
                Message.find({ _id: conversation.messages[conversation.messages.length - 1] })
                    .limit(1)
                    .exec((err, message) => {
                        if (err) {
                            return res.status(401).json({ message: "Conversation without messages" });
                        }

                        if (message.length > 0) {
                            message = message[0];

                            let hasMessages = message.toOpen.indexOf(req.user.id) > -1;
                            let numMessages = 0;
                            if (hasMessages) {
                                conversationsNotOpened++;
                            }
                            fullConversations.push({ message, numMessages });
                            if (fullConversations.length === conversations.length) {
                                return res.status(200).json({
                                    message: fullConversations.length + " conversations", data: { conversations: fullConversations, notOpened: conversationsNotOpened }
                                });
                            }
                        } else {
                            return res.status(401).json({ message: "Conversation without messages" });
                        }
                    });
            });
        });
}

exports.getConversation = function (req, res, next) {
    Conversation.find({ _id: req.params.conversationId, participants: req.user.id })
        .populate({
            path: 'messages',
            populate: {
                path: 'author',
                select: 'username'
            },
            options: { sort: '-createdAt' }
        })
        .exec(function (err, messages) {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            if (messages.length > 0) {
                messages = messages[0].messages;
                let hasMessages = messages[0].toOpen.indexOf(req.user.id) > -1;
                let indexes = [];
                if (hasMessages) {
                    for (let i = 0; i < messages.length && messages[0].toOpen.indexOf(req.user.id) > -1 ; i++) {
                        messages[i].toOpen.splice(messages[i].toOpen.indexOf(req.user.id), 1);
                        messages[i].save();
                    }
                    res.status(200).json({ conversation: messages });
                    return next();

                } else {
                    res.status(200).json({ conversation: messages });
                    return next();
                }
            } else {
                res.status(200).json({ message: 'You are not in this conversation!' });
                return (next);
            }
        });
}

exports.newConversation = function (req, res, next) {
    if (!req.params.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
        return next();
    }

    if (!req.body.composedMessage) {
        res.status(422).send({ error: 'Please enter a message.' });
        return next();
    }

    const relatedTo = req.params.recipient;

    const conversation = new Conversation({
        participants: [req.user.id, relatedTo],
        messages: []
    });

    const message = new Message({
        conversationId: conversation._id,
        body: req.body.composedMessage,
        author: req.user.id,
        toOpen: [relatedTo]
    });

    conversation.messages.push(message._id);

    conversation.save(function (err, newConversation) {
        if (err) {
            res.send({ error: err });
            return next(err);
        }

        message.save(function (err, newMessage) {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            res.status(200).json({ message: 'Conversation started!', conversationId: conversation.id });
            return next();
        });
    });
}

exports.sendReply = function (req, res, next) {
    Conversation.find({ _id: req.params.conversationId, participants: req.user.id })
        .limit(1)
        .exec((err, conversation) => {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            if (conversation.length > 0) {
                conversation = conversation[0];
                const relatedTo = conversation.participants.filter(function (e) {
                    return e != req.user.id;
                });

                const reply = new Message({
                    conversationId: req.params.conversationId,
                    body: req.body.composedMessage,
                    author: req.user.id,
                    toOpen: relatedTo
                });

                conversation.messages.push(reply._id);
                conversation.save(function (err, newConversation) {
                    if (err) {
                        res.send({ error: err });
                        return next(err);
                    }
                    reply.save(function (err, sentReply) {
                        if (err) {
                            res.send({ error: err });
                            return next(err);
                        }

                        res.status(200).json({ message: 'Reply successfully sent!' });
                        return (next);
                    });
                })
            } else {
                res.status(200).json({ message: 'You are not in this conversation!' });
                return (next);
            }

        });

}