// Create web server
const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');
const { isLoggedIn } = require('./middlewares');
const { isNotLoggedIn } = require('./middlewares');

// 댓글 생성
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const comment = await Comment.create({
            content: req.body.content,
            postId: req.body.postId,
            userId: req.user.id
        });
        const fullComment = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: User,
                attributes: ['id', 'nick']
            }]
        });
        res.status(201).json(fullComment);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 댓글 수정
router.patch('/:commentId', isLoggedIn, async (req, res, next) => {
    try {
        await Comment.update({
            content: req.body.content
        }, {
            where: {
                id: req.params.commentId,
                userId: req.user.id
            }
        });
        res.status(200).json({ CommentId: parseInt(req.params.commentId, 10), content: req.body.content });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 댓글 삭제
router.delete('/:commentId', isLoggedIn, async (req, res, next) => {
    try {
        await Comment.destroy({
            where: {
                id: req.params.commentId,
                userId: req.user.id
            }
        });
        res.status(200).json({ CommentId: parseInt(req.params.commentId, 10) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 댓글 좋아요
router.post('/:commentId/like', isLoggedIn, async (req, res, next) => {
    try {
        const comment = await Comment.findOne({ where: { id: req.params.commentId } });
        if (!comment) {
            return res.status(403).send('댓글이 존재하지 않습니다.');
        }
        await comment.addLiker(req.user.id);
        res.json({ CommentId: comment.id, UserId: req.user.id });
    }
     catch (error) {};
})