const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Event = require('../models/event');

// fetch all categories
router.get('/', (req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) return next(err);
    res.render('listCategories', { categories });
  });
});

// create an event category
router.get('/new', (req, res, next) => {
  res.render('categoryForm');
});

router.post('/', (req, res, next) => {
  console.log(req.body);
  Category.create(req.body, (err, category) => {
    if (err) return next(err);
    res.redirect('/categories');
  });
});

// fetch single category and related events
router.get('/:id', (req, res, next) => {
  let id = req.params.id;
  Category.findById(id, (err, category) => {
    if (err) return next(err);
    Event.find({ event_category: id }, (err, events) => {
      if (err) return next(err);
      res.render('categoryDetail', { category, events });
    });
  });
});

// increment like count
router.get('/:id/like', (req, res, next) => {
  let id = req.params.id;
  Category.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    (err, updatedCategory) => {
      if (err) return next(err);
      res.redirect(`/categories/${id}`);
    }
  );
});

// edit category details
router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id;
  Category.findById(id, (err, category) => {
    if (err) return next(err);
    res.render('categoryEdit', { category });
  });
});

router.post('/:id/edit', (req, res, next) => {
  let id = req.params.id;
  Category.findByIdAndUpdate(id, req.body, (err, updatedCategory) => {
    if (err) return next(err);
    res.redirect(`/categories/${updatedCategory.id}`);
  });
});

// delete category
router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id;
  Category.findByIdAndDelete(id, (err, deletedCategory) => {
    if (err) return next(err);
    Event.updateMany(
      { event_category: id },
      { $pull: { id } },
      (err, updatedEvent) => {
        if (err) return next(err);
        res.redirect('/categories');
      }
    );
  });
});

module.exports = router;
