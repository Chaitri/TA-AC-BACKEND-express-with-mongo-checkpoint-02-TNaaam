const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let remarkSchema = new Schema(
  {
    content: { type: String, required: true },
    author: String,
    likes: { type: Number, default: 0 },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Remark', remarkSchema);
