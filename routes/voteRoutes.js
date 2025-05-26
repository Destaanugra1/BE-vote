const express = require('express');
const router = express.Router();
const { vote, getVoteStats } = require('../controllers/voteController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, vote);
router.get('/stats', getVoteStats);

module.exports = router