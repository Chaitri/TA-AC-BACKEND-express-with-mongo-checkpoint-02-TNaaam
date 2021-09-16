const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Category = require('../models/category');
const Remark = require('../models/remark');
const { DateTime } = require('luxon');
const url = require('url');

// fetch all events
router.get('/', (req, res) => {
  let parsedUrl = url.parse(req.url, true);
  let query = parsedUrl.query;
  let locations;
  // get all locations
  Event.find({})
    .select({ location: 1 })
    .exec((err, locs) => {
      if (err) return next(err);
      locations = new Set(locs.map((loc) => loc.location));
    });
  if (parsedUrl.path === '/') {
    Event.find({})
      .sort({ createdAt: -1 })
      .exec((err, events) => {
        if (err) return next(err);

        // fill default dates
        let startDate = DateTime.now();
        let endDate = startDate
          .plus({ days: 7 })
          .toFormat("yyyy-LL-dd'T'HH:mm");
        startDate = startDate.toFormat("yyyy-LL-dd'T'HH:mm");

        // fetch all categories and render page
        Category.find({}, (err, categories) => {
          if (err) return next(err);
          return res.render('listEvents', {
            events,
            categories,
            locations,
            startDate,
            endDate,
          });
        });
      });
  } else {
    let startDateQuery = query.start_date.split('T');
    let sdate = startDateQuery[0].split('-');
    let stime = startDateQuery[1].split(':');

    let startDt = DateTime.fromObject({
      day: sdate[2],
      month: sdate[1],
      hour: stime[0],
      minute: stime[1],
    }).toJSDate();

    let endDateQuery = query.end_date.split('T');
    let edate = endDateQuery[0].split('-');
    let etime = endDateQuery[1].split(':');

    let endDt = DateTime.fromObject({
      day: edate[2],
      month: edate[1],
      hour: etime[0],
      minute: etime[1],
    }).toJSDate();

    // dates to pre-poluate form
    let startDate = DateTime.now();
    let endDate = startDate.plus({ days: 7 }).toFormat("yyyy-LL-dd'T'HH:mm");
    startDate = startDate.toFormat("yyyy-LL-dd'T'HH:mm");

    if (query.category === 'all' && query.location === 'all') {
      Event.find({
        start_date: { $gte: startDt, $lte: endDt },
      })
        .sort({ createdAt: query.order })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            return res.render('listEvents', {
              events,
              categories,
              locations,
              startDate,
              endDate,
            });
          });
        });
    } else if (query.category === 'all') {
      Event.find({
        location: query.location,
        start_date: { $gte: startDt, $lte: endDt },
      })
        .sort({ createdAt: query.order })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            return res.render('listEvents', {
              events,
              categories,
              locations,
              startDate,
              endDate,
            });
          });
        });
    } else if (query.location === 'all') {
      Event.find({
        event_category: query.category,
        start_date: { $gte: startDt, $lte: endDt },
      })
        .sort({ createdAt: query.order })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            return res.render('listEvents', {
              events,
              categories,
              locations,
              startDate,
              endDate,
            });
          });
        });
    } else {
      Event.find({
        event_category: query.category,
        location: query.location,
        start_date: { $gte: startDt, $lte: endDt },
      })
        .sort({ createdAt: query.order })
        .exec((err, events) => {
          if (err) return next(err);
          Category.find({}, (err, categories) => {
            if (err) return next(err);
            return res.render('listEvents', {
              events,
              categories,
              locations,
              startDate,
              endDate,
            });
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

    Category.updateMany(
      { id: { $in: event.event_category } },
      { $push: { eventId: event.id } },
      (err, category) => {
        if (err) return next(err);
        res.redirect('/events');
      }
    );
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

      let newFormat = { ...DateTime.DATETIME_FULL, weekday: 'long' };

      let startDate = DateTime.fromJSDate(event.start_date).toLocaleString(
        newFormat
      );

      let endDate = DateTime.fromJSDate(event.end_date).toLocaleString(
        newFormat
      );

      res.render('eventDetail', { event, startDate, endDate });
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
    let start_date = DateTime.fromJSDate(event.start_date).toFormat(
      "yyyy-LL-dd'T'HH:mm"
    );
    let end_date = DateTime.fromJSDate(event.end_date).toFormat(
      "yyyy-LL-dd'T'HH:mm"
    );

    Category.find({}, (err, categories) => {
      if (err) return next(err);
      res.render('eventEdit', { event, categories, start_date, end_date });
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
