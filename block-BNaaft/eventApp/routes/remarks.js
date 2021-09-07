const express = require('express');
const router = express.Router();
const Remark = require('../models/remark');
const Event = require('../models/event');

// increment remark's like count
router.get('/:id/like', (req, res, next) => {
  let id = req.params.id;
  Remark.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, remark) => {
    if (err) return next(err);
    res.redirect(`/events/${remark.eventId}`);
  });
});

// edit remark
router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id;
  Remark.findById(id, (err, remark) => {
    if (err) return next(err);
    res.render('remarkForm', { remark });
  });
});

router.post('/:id', (req, res, next) => {
  let id = req.params.id;
  Remark.findByIdAndUpdate(id, req.body, (err, remark) => {
    if (err) return next(err);
    res.redirect(`/events/${remark.eventId}`);
  });
});

// delete remark
router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id;
  Remark.findByIdAndDelete(id, (err, deletedRemark) => {
    if (err) return next(err);
    Event.findByIdAndUpdate(
      deletedRemark.eventId,
      { $pull: { remarks: deletedRemark.id } },
      (err, updatedEvent) => {
        if (err) return next(err);
        res.redirect(`/events/${updatedEvent.id}`);
      }
    );
  });
});

module.exports = router;
