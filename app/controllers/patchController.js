const FACTORY_PRESETS = require('../public/js/factory-presets');

// In a real application, you would use a database.
// For now, we'll use an in-memory array for user patches.
let userPatches = [];
let currentId = 1;

// @desc    Save a new patch
exports.savePatch = async (req, res) => {
    try {
        const { name, instrument, data } = req.body;

        if (!name || !instrument || !data) {
            return res.status(400).json({ msg: 'Please include a name, instrument, and patch data' });
        }

        const newPatch = {
            id: `user-${currentId++}`, // Distinguish user patches
            name,
            instrument,
            data,
            createdAt: new Date(),
            isUserPatch: true
        };

        userPatches.push(newPatch);

        res.status(201).json(newPatch);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all patches for a specific instrument (user + factory)
exports.getPatchesByInstrument = async (req, res) => {
    try {
        const instrument = req.params.instrument;
        
        // Get user-saved patches
        const userInstrumentPatches = userPatches.filter(p => p.instrument === instrument);
        
        // Get factory presets for the instrument
        const factoryInstrumentPatches = (FACTORY_PRESETS[instrument] || []).map((p, index) => ({
            id: `factory-${instrument}-${index}`,
            ...p,
            isUserPatch: false
        }));

        // Combine them, with user patches first
        const allPatches = [...userInstrumentPatches, ...factoryInstrumentPatches];
        
        res.json(allPatches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single patch by its ID
exports.getPatchById = async (req, res) => {
    try {
        const patchId = req.params.id;
        let patch;

        if (patchId.startsWith('user-')) {
            patch = userPatches.find(p => p.id === patchId);
        } else if (patchId.startsWith('factory-')) {
            const [, instrument, index] = patchId.split('-');
            patch = {
                id: patchId,
                ...(FACTORY_PRESETS[instrument]?.[parseInt(index)]),
                isUserPatch: false
            };
        }

        if (!patch || !patch.name) {
            return res.status(404).json({ msg: 'Patch not found' });
        }
        res.json(patch);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
