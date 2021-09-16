const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let categorySchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String },
    likes: { type: Number, default: 0 },
    eventId: { type: [Schema.Types.ObjectId], ref: 'Event' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
