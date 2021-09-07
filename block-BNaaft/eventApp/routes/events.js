const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Category = require('../models/category');
const Remark = require('../models/remark');

// fetch all events
router.get('/', (req, res) => {
  Event.find({}, (err, events) => {
    if (err) return next(err);
    Category.find({}, (err, categories) => {
      if (err) return next(err);
      res.render('listEvents', { events, categories });
    });
  });
});

// to select category
router.post('/category', (req, res, next) => {
  let categoryId = req.body.category;

  let sortBy = req.body.sort;
  if (sortBy === 'newest') {
    if (categoryId === '/') {
      Event.find({})
        .sort({ createdAt: -1 })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            return res.render('listEvents', { events, categories });
          });
        });
    } else {
      Event.find({ event_category: categoryId })
        .sort({ createdAt: -1 })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            res.render('listEvents', { events, categories });
          });
        });
    }
  } else if (sortBy === 'oldest') {
    if (categoryId === '/') {
      Event.find({})
        .sort({ createdAt: 1 })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            return res.render('listEvents', { events, categories });
          });
        });
    } else {
      Event.find({ event_category: categoryId })
        .sort({ createdAt: 1 })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            res.render('listEvents', { events, categories });
          });
        });
    }
  } else if (sortBy === 'location') {
    if (categoryId === '/') {
      Event.find({})
        .sort({ location: 1 })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            return res.render('listEvents', { events, categories });
          });
        });
    } else {
      Event.find({ event_category: categoryId })
        .sort({ location: 1 })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            res.render('listEvents', { events, categories });
          });
        });
    }
  }
});

// create a new event
router.get('/new', (req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) return next(err);
    res.render('eventForm', { categories });
  });
});

router.post('/', (req, res, next) => {
  Event.create(req.body, (err, event) => {
    if (err) return next(err);
    event.event_category.forEach((categoryId) => {
      Category.findByIdAndUpdate(
        categoryId,
        { $push: { eventId: event.id } },
        (err, category) => {
          if (err) return next(err);
          res.redirect('/events');
        }
      );
    });
  });
});

// fetch single event along with all corresponding events
router.get('/:id', (req, res, next) => {
  let id = req.params.id;

  Event.findById(id)
    .populate('event_category')
    .populate('remarks')
    .exec((err, event) => {
      if (err) return next(err);
      res.render('eventDetail', { event });
    });
});

// to increment like count
router.get('/:id/like', (req, res, next) => {
  let id = req.params.id;
  Event.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true },
    (err, event) => {
      if (err) return next(err);
      res.redirect(`/events/${id}`);
    }
  );
});

// to edit event
router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id;

  Event.findById(id, (err, event) => {
    if (err) return next(err);
    Category.find({}, (err, categories) => {
      if (err) return next(err);
      res.render('eventEdit', { event, categories });
    });
  });
});

router.post('/:id', (req, res, next) => {
  let id = req.params.id;
  Event.findByIdAndUpdate(id, req.body, (err, event) => {
    if (err) return next(err);
    res.redirect(`/events/${event.id}`);
  });
});

// delete event
router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id;
  Event.findByIdAndDelete(id, (err, deletedEvent) => {
    if (err) return next(err);
    Remark.deleteMany({ eventId: id }, (err, info) => {
      if (err) return next(err);
      Category.updateMany(
        { eventId: id },
        { $pull: { eventId: id } },
        (err, updatedCategory) => {
          if (err) return next(err);
          res.redirect('/events');
        }
      );
    });
  });
});

// to add remark
router.post('/:id/remarks', (req, res, next) => {
  let id = req.params.id;
  req.body.eventId = id;
  Remark.create(req.body, (err, remark) => {
    if (err) return next(err);
    Event.findByIdAndUpdate(
      id,
      { $push: { remarks: remark.id } },
      (err, event) => {
        if (err) return next(err);
        res.redirect(`/events/${id}`);
      }
    );
  });
});

module.exports = router;
