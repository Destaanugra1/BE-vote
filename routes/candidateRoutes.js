const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { createCandidate, getCandidates, getCandidateById, getUsers, deleteCandidate } = require('../controllers/candidateController');

router.get('/', getCandidates);
router.get('/users', getUsers);
router.delete('/:id', verifyToken, requireRole('admin'), deleteCandidate);
router.get('/:id', getCandidateById);
router.post('/create', verifyToken, requireRole('admin'), upload.single('photo'), createCandidate);

module.exports = router;
