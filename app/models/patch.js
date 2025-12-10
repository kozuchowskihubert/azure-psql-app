// This file would typically define a database schema using an ORM like Mongoose or Sequelize.
// For this example, we are using an in-memory store managed by the controller,
// so this file is a placeholder to illustrate where the model definition would go.

const patchSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  instrument: {
    type: String,
    required: true,
    trim: true,
  },
  data: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

// When using a database, you would export the model like this:
// const mongoose = require('mongoose');
// module.exports = mongoose.model('Patch', patchSchema);

// For now, we export nothing as the data is handled in the controller.
module.exports = {};
