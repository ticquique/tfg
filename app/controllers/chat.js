"use strict"
const Conversation = require('../models/conversation'),
    Message = require('../models/message'),
    User = require('../models/user');


const conversations = (userID, skip = 0, limit = 20, filterUser = null, next) => {
    // Only return one message from each conversation to display as snippet
    const query = filterUser ?
        Conversation.find({ participants: { $all: [userID, filterUser] } }) :
        Conversation.find({ participants: userID });

    query.sort('updatedAt')
        .populate({
            path: 'messages',
            populate: {
                path: 'author',
                select: 'username'
            },
            options: {
                limit: 1
            }
        })
        .populate({
            path: 'participants',
            select: 'username'
        })
        .limit(limit)
        .skip(skip * limit)
        .exec(function (err, conversations) {
            if (err) {
                return next(err);
            }

            if (conversations && conversations.length === 0) {
                return next(null, {
                    conversations: [],
                    notOpened: 0
                });
            }

            // Set up empty array to hold conversations + most recent message
            let fullConversations = [];
            let conversationsNotOpened = 0;
            conversations.forEach(function (conversation) {
                if (conversation.messages) {
                    let message = conversation.messages[0];
                    if (message) {
                        let hasMessages = message.toOpen.indexOf(userID) > -1;
                        let numMessages = 0;
                        if (hasMessages) {
                            conversationsNotOpened++;
                        }
                        fullConversations.unshift({ conversationID: conversation._id, participants: conversation.participants, message, numMessages });
                        if (fullConversations.length === conversations.length) {
                            return next(null, {
                                conversations: fullConversations,
                                notOpened: conversationsNotOpened
                            });
                        }
                    } else {
                        fullConversations.unshift({ conversationID: conversation._id, participants: conversation.participants });
                        if (fullConversations.length === conversations.length) {
                            return next(null, {
                                conversations: fullConversations,
                                notOpened: conversationsNotOpened
                            });
                        }
                    }
                } else {
                    return next({ message: "No conversations yet" });
                }
            });
        });
}

const conversation = (userID, conversationID, skip = 0, limit = 20, next) => {
    Conversation.find({ _id: conversationID, participants: userID })
        .populate({
            path: 'messages',
            populate: {
                path: 'author',
                select: 'username'
            },
            options: {
                limit: limit,
                sort: '-createdAt',
                skip: skip * limit
            }
        })
        .populate({
            path: 'participants',
            select: 'username'
        })
        .exec(function (err, conversation) {
            if (err) {
                return next(err);
            }

            if (conversation.length > 0) {
                if (conversation[0].messages && conversation[0].messages.length > 0) {
                    const messages = conversation[0].messages;
                    let hasMessages = messages[0].toOpen.indexOf(userID) > -1;
                    let indexes = [];
                    if (hasMessages) {
                        for (let i = 0; i < messages.length && messages[0].toOpen.indexOf(userID) > -1; i++) {
                            messages[i].toOpen.splice(messages[i].toOpen.indexOf(userID), 1);
                            messages[i].save();
                        }
                    }
                    return next(null, {
                        conversationID: conversation[0]._id,
                        participants: conversation[0].participants,
                        messages
                    });
                } else {
                    return next(null, {
                        conversationID: conversation[0]._id,
                        participants: conversation[0].participants,
                        messages: []
                    });
                }
            } else {
                return next('You are not in this conversation!');
            }
        });
}


const sendReply = (userID, conversationId, composedMessage, next) => {
    Conversation.find({ _id: conversationId, participants: userID })
        .limit(1)
        .exec((err, conversation) => {
            if (err) {
                next(err);
            }

            if (conversation.length > 0) {
                conversation = conversation[0];
                const relatedTo = conversation.participants.filter(function (e) {
                    return e != userID;
                });

                const reply = new Message({
                    conversationID: conversationId,
                    body: composedMessage,
                    author: userID,
                    toOpen: relatedTo
                });

                conversation.messages.unshift(reply._id);
                conversation.save(function (err, newConversation) {
                    if (err) {
                        next(err);
                    }
                    reply.save(function (err, sentReply) {
                        if (err) {
                            next(err);
                        }

                        next(null, sentReply);
                    });
                })
            } else {
                next('You are not in this conversation!');
            }

        });
}

exports.getConversations = function (req, res, next) {
    const skip = req.query.p || 0;
    const limit = req.query.l || 20;
    const filterUser = req.query.u || null;

    if (req.user && req.user.id) {
        const userID = req.user.id;
        conversations(userID, skip, limit, filterUser, function (err, data) {
            if (err) return res.status(401).json({ message: err });
            else {
                return res.status(200).json(
                    data
                );
            }
        });
    } else {
        return res.status(401).json({ message: "No conversations yet" });
    }
}

exports.getConversation = function (req, res, next) {
    const skip = req.query.p || 0;
    const limit = req.query.l || 20;

    if (req.user && req.user.id && req.params && req.params.conversationId) {
        const userID = req.user.id;
        const conversationID = req.params.conversationId;
        conversation(userID, conversationID, 0, 20, (err, data) => {
            if (err) return res.status(401).json({ message: err });
            else {
                return res.status(200).json(data);
            }
        })
    } else {
        return res.status(401).json({ message: "No conversations yet" });
    }
}

exports.newConversation = function (req, res, next) {
    if (!req.params.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
        return next();
    }
    if (!req.query.whoname) {
        res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
        return next();
    }

    const whoname = req.query.whoname;

    const relatedTo = req.params.recipient;

    const conversation = new Conversation({
        participants: [req.user.id, relatedTo],
        messages: []
    });

    let message = null;

    Conversation.find({ participants: { "$size": 2, "$all": [req.user.id, relatedTo] } })
        .limit(1)
        .populate({
            path: 'participants',
            select: 'username'
        })
        .exec((err, data) => {

            if (err) {
                res.status(401).json({ error: err });
                return next(err);
            } else if (data && data.length > 0) {
                res.status(200).json({
                    conversationID: data[0]._id,
                    participants: data[0].participants
                });
                return next();
            } else {
                if (req.body.compossition) {
                    message = new Message({
                        conversationID: conversation._id,
                        body: req.body.compossition,
                        author: req.user.id,
                        toOpen: [relatedTo]
                    });
                    conversation.messages.push(message._id);
                }
                conversation.save(function (err, newConversation) {
                    if (err) {
                        res.send({ error: err });
                        return next(err);
                    }
                    const participants = [];
                    for (let i = 0; i < newConversation.participants.length; i++) {
                        const element = newConversation.participants[i];
                        const username = element == req.user.id ? req.user.username : whoname;
                        participants.push({
                            _id: element,
                            username
                        })
                    }
                    if (req.body.compossition) {
                        message.save(function (err, newMessage) {
                            if (err) {
                                res.send({ error: err });
                                return next(err);
                            }

                            res.status(200).json({
                                conversationID: newConversation._id,
                                participants,
                                messages: newConversation.messages
                            });
                            return next();
                        });
                    } else {
                        res.status(200).json({
                            conversationID: newConversation._id,
                            participants,
                            messages: newConversation.messages
                        });
                        return next();
                    }

                });
            }
        });

}

exports.sendReply = function (req, res, next) {
    try {
        req.checkParams("conversationId", "Needs a conversation id").notEmpty().withMessage("Conversation id can't be empty");
        req.checkBody("composedMessage", "Needs a message to send").notEmpty().withMessage("Message can't be empty");

        let errors = req.validationErrors();
        if (errors) throw errors;
        sendReply(req.user.id, req.params.conversationId, req.body.composedMessage, (err, data) => {
            if(err) {
                res.status(401).json(err);
                return next();
            } else {
                res.status(200).json(data);
                return next();
            }
        });
    } catch (err) {
        res.status(401).json(err);
        return next();
    }
}


exports.conversations = conversations;
exports.conversation = conversation;
exports.reply = sendReply;