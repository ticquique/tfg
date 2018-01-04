const Post = require('../models/post'),
    Like = require('../models/like'),
    Dislike = require('../models/dislike'),
    User = require('../models/user'),
    Followers = require('../models/follower'),
    Followeds = require('../models/follow'),
    ratios = {
        followerst: 0.15,
        followedst: 0.8
    },
    total = 30;

exports.deletePost = function (req, res, next) {
    Post.findOneAndRemove({ _id: req.params.postId, creator: req.user.id })
        .exec(function (err, post) {
            if (err) {
                res.json({ success: false, msg: 'Cannot execute the function' });
                return (next);
            } else if (!post) {
                Post.findById(req.params.postId).exec((err, postReject) => {
                    if (err) {
                        res.json({ success: false, msg: 'Cannot execute the function' });
                        return (next);
                    } else if (!postReject) {
                        res.status(404).json({ success: false, msg: 'Post not found' });
                        return (next);
                    } else {
                        res.status(404).json({ success: false, msg: "You are not allowed to remove this post" });
                        return (next);
                    }
                });
            } else {
                Like.update({ related: req.params.postId }, { relatedUp: false, related: "5a4d0b1c0d503806189082cd" }).exec(function (err, like) {
                    if (err) {
                        res.json({ success: false, msg: 'Cannot execute the function' });
                        return (next);
                    } else {
                        Dislike.update({ related: req.params.postId }, { relatedUp: false, related: "5a4d0b1c0d503806189082cd" }).exec(function (err, dislike) {
                            if (err) {
                                res.json({ success: false, msg: 'Cannot execute the function' });
                                return (next);
                            } else {

                                res.status(200).json({ success: true, msg: "Post correctly deleted" });
                            }
                        });
                    }
                });
            }
        });
}

exports.getPosts = function (req, res, next) {
    let fullPosts = [];
    Followers.findOne({ 'user': req.user.id }).lean().exec(function (err, followerst) {
        if (err) {
            res.json({ success: false, msg: 'Cannot execute the function' });
            return (next);
        }
        if (!followerst) {
            ratios.followers = 0;
        }
        Followeds.findOne({ 'user': req.user.id }).lean().exec(function (err, followedst) {
            if (err) {
                res.json({ success: false, msg: 'Cannot execute the function' });
                return (next);
            }
            if (!followedst) {
                ratios.followeds = 0;
            }
            var other = 1 - ratios.followeds - ratios.followers;

            Post.find({ 'creator': { $in: followedst } })
                .populate('likes')
                .populate('dislikes')
                .populate('creator')
                .sort('-createdAt')
                .limit(total * ratios.followedst)
                .exec(function (err, followedstposts) {
                    if (err) {
                        res.send({ error: err });
                        return next(err);
                    }
                    if (followedstposts.length < total * ratios.followedst) {
                        var lowratio = followedstposts.length / total;
                        ratios.followerst += (ratios.followedst - lowratio) / 2;
                        other += (ratios.followedst - lowratio) / 2;
                    }
                    if (!followedstposts.length !== 0) {
                        fullPosts = fullPosts.concat(followedstposts);

                    }
                    Post.find({ 'creator': { $in: followerst, $nin: followedst } })
                        .populate('likes')
                        .populate('dislikes')
                        .populate('creator')
                        .sort('-createdAt')
                        .limit(total * ratios.followerst)
                        .exec(function (err, followerstposts) {
                            if (err) {
                                res.send({ error: err });
                                return next(err);
                            }
                            if (followerstposts.length < total * ratios.followerst) {
                                var lowratio = followerstposts.length / total;
                                other += ratios.followerst - lowratio;
                            }
                            if (!followerstposts.length !== 0) {
                                fullPosts = fullPosts.concat(followerstposts);
                            }

                            var nof = [req.user.id];
                            if (followedst === null && followerst === null) {
                                nof = [req.user.id];
                            } else if (followedst === null) {
                                nof = nof.concat(followerst);
                            } else if (followerst === null) {
                                nof = nof.concat(followedst);
                            } else {
                                nof = nof.concat(followerst, followedst);
                            }

                            Post.find({ 'creator': { $nin: nof } })
                                .populate('likes')
                                .populate('dislikes')
                                .populate('creator')
                                .sort('-createdAt')
                                .limit(total * other)
                                .exec(function (err, othersposts) {
                                    if (err) {
                                        res.send({ error: err });
                                        return next(err);
                                    }
                                    if (!othersposts.length !== 0) {
                                        fullPosts = fullPosts.concat(othersposts);
                                    }

                                    res.status(200).json({ postList: fullPosts });
                                });
                        });
                });
        });
    });
}

exports.addPost = function (req, res, next) {
    console.log(req.user.id);

    if (!req.body.title) {
        res.status(422).send({ error: 'Please enter a title.' });
        return next();
    }
    if (!req.body.attachments && !req.body.message) {
        res.status(422).send({ error: 'Please attach some file and enter a valid message.' });
        return next();
    }

    const post = new Post({
        title: req.body.title,
        creator: req.user.id
    });

    if (req.body.attachments) {
        post.attachments = req.body.attachments;
    } else {
        post.message = req.body.message;
    }

    post.save(function (err, sentpost) {
        if (err) {
            res.send({ error: err });
            return next(err);
        }

        res.status(200).json({ message: 'post successfully sent!' });
        return (next);
    });
}

exports.addLike = function (req, res, next) {
    const like = new Like({
        related: req.params.postId,
        user: req.user.id,
    });

    Post.findById(req.params.postId)
        .populate('likes')
        .populate('dislikes')
        .exec(function (err, post) {
            if (req.params.postId, err) {
                res.json({ success: false, msg: 'Cannot execute the function' });
                return (next);
            }

            if (!post) {
                res.json({ success: false, msg: 'No post related' });
                return (next);
            } else {
                var arrayHaveLike = (post.likes.filter(function (isLike) {
                    return isLike.user.equals(req.user.id);
                }));
                if (arrayHaveLike.length > 0) {
                    Like.remove({ 'user': req.user.id, 'related': req.params.postId }).exec();
                    var likeaux = arrayHaveLike[0]._id;
                    post.likes.pull(likeaux);
                    post.save();

                    User.update({ _id: req.user.id }, { $pull: { likes: likeaux } }).exec();
                    //Si le ha dado return sin hacer nada
                    res.status(200).json({ message: "Like was given yet" });
                    return (next);
                } else {
                    var arrayHaveDislike = (post.dislikes.filter(function (isDislike) {
                        return isDislike.user.equals(req.user.id);
                    }));
                    if (arrayHaveDislike.length > 0) {
                        var dislikeaux = arrayHaveDislike[0]._id;
                        Dislike.remove({ 'user': req.user.id, 'related': req.params.postId }).exec();
                        post.dislikes.pull(dislikeaux);
                        User.update({ _id: req.user.id }, { $pull: { dislikes: dislikeaux } }).exec();
                    }
                    like.save(function (err, sentlike) {
                        if (err) {
                            res.send({ error: err });
                            return next(err);
                        }
                        sentlikeId = sentlike._id;
                        User.update({ _id: req.user.id }, { $push: { likes: sentlikeId } }).exec();
                        post.likes.push(sentlikeId);
                        post.save();
                        res.status(200).json({ message: 'like successfully sent!' });
                        return (next);
                    });

                }
            }
        });
}

exports.addDislike = function (req, res, next) {
    const dislike = new Dislike({
        related: req.params.postId,
        user: req.user.id,
    });

    Post.findById(req.params.postId)
        .populate('dislikes')
        .populate('likes')
        .exec(function (err, post) {
            if (req.params.postId, err) {
                res.json({ success: false, msg: 'Cannot execute the function' });
                return (next);
            }

            if (!post) {
                res.json({ success: false, msg: 'No post related' });
                return (next);
            } else {
                var arrayHaveDislike = (post.dislikes.filter(function (isDislike) {
                    return isDislike.user.equals(req.user.id);
                }));
                if (arrayHaveDislike.length > 0) {
                    Dislike.remove({ 'user': req.user.id, 'related': req.params.postId }).exec();
                    var dislikeaux = arrayHaveDislike[0]._id;
                    post.dislikes.pull(dislikeaux);
                    post.save();
                    User.update({ _id: req.user.id }, { $pull: { dislikes: dislikeaux } }).exec();
                    //Si le ha dado return sin hacer nada
                    res.status(200).json({ message: "Dislike was given yet" });
                    return (next);
                } else {
                    var arrayHaveLike = (post.likes.filter(function (isLike) {
                        return isLike.user.equals(req.user.id);
                    }));
                    if (arrayHaveLike.length > 0) {
                        var likeaux = arrayHaveLike[0]._id;
                        Like.remove({ 'user': req.user.id, 'related': req.params.postId }).exec();
                        post.likes.pull(likeaux);
                        User.update({ _id: req.user.id }, { $pull: { likes: likeaux } }).exec();
                    }
                    dislike.save(function (err, sentDislike) {
                        if (err) {
                            res.send({ error: err });
                            return next(err);
                        }
                        sentDislikeId = sentDislike._id;
                        User.update({ _id: req.user.id }, { $push: { dislikes: sentDislikeId } }).exec();
                        post.dislikes.push(sentDislikeId);
                        post.save();
                        res.status(200).json({ message: 'dislike successfully sent!' });
                        return (next);
                    });

                }
            }
        });
}