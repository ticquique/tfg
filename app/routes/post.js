
var post = require('../controllers/post');

module.exports = function (router) {
    'use strict';
    
    router.route('/')
        .get(post.getPosts)
        .post(post.addPost);

    router.route('/:postId')
        .delete(post.deletePost);

    router.route('/:postId/like')
        .post(post.addLike);

    router.route('/:postId/dislike')
        .post(post.addDislike);
};