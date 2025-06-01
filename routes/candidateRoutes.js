const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { createCandidate, editCandidate, getCandidates, getCandidateById, getUsers, deleteCandidate } = require('../controllers/candidateController');

router.get('/', getCandidates);
router.get('/users', getUsers);
router.get('/:id', getCandidateById);
router.post('/create', verifyToken, requireRole('admin'), upload.single('photo'), createCandidate);
router.put('/:id', verifyToken, requireRole('admin'), upload.single('photo'), editCandidate);
router.delete('/:id', verifyToken, requireRole('admin'), deleteCandidate);

module.exports = router;
