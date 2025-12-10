const express = require('express');
const router = express.Router();
const patchController = require('../controllers/patchController');

// @route   POST api/patches
// @desc    Save a new patch
// @access  Public
router.post('/', patchController.savePatch);

// @route   GET api/patches/:instrument
// @desc    Get all patches for an instrument
// @access  Public
router.get('/:instrument', patchController.getPatchesByInstrument);

// @route   GET api/patches/id/:id
// @desc    Get a patch by its ID
// @access  Public
router.get('/id/:id', patchController.getPatchById);

module.exports = router;
