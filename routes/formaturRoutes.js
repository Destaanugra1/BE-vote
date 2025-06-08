const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { createFormatur, getFormatur, deleteFormatur, editFormatur, getFormaturById } = require('../controllers/formaturController');

router.post('/create', verifyToken, requireRole('admin'), upload.single('photo'), createFormatur);
router.get('/formatur', getFormatur);
router.delete('/:id', verifyToken, requireRole('admin'), deleteFormatur);
router.put('/:id', verifyToken, requireRole('admin'), upload.single('photo'), editFormatur);
router.get('/:id', verifyToken, requireRole('admin'), getFormaturById);
module.exports = router;