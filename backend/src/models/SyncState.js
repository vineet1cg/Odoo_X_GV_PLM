const mongoose = require('mongoose');

const SyncStateSchema = new mongoose.Schema({
  direction:    { type: String, unique: true, required: true },
  lastSyncedAt: { type: Date, default: new Date(0) },
});

module.exports = mongoose.models.SyncState ||
  mongoose.model('SyncState', SyncStateSchema);
