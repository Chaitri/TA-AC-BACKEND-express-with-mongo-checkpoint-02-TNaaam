const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let eventSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: String,
    host: String,
    image: { type: String, required: true },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, default: Date.now },
    event_category: { type: [Schema.Types.ObjectId], ref: 'Category' },
    location: String,
    likes: { type: Number, default: 0 },
    remarks: { type: [Schema.Types.ObjectId], ref: 'Remark' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
