/* *
*
*       Complete the API routing below
*
* */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {

  app.route('/api/books')
  .get(function(req, res) {
    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.collection('books').find({}, {
        title: 1,
        commentcount: 1
      }).toArray((err, docs) => {
        if (err)
          console.log(err);
        res.json(docs);
        db.close();
      });
    });
  })

  .post(function(req, res) {
    var title = req.body.title;
    if (!title.replace(/\s/g, '')) {
      res.json('missing title');
    } else {
      //response will contain new book object including atleast _id and title
      var newBook = {
        title: title,
        comments: [String],
        commentcount: 0
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('books').insertOne(newBook, (err, docs) => {
          if (err) {
            db.close();
            console.log(err);
          }
          res.json(docs.ops[0]);
          db.close();
        });
      });
    }
  })

  .delete(function(req, res) {
    //if successful response will be 'complete delete successful'
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.collection('books').deleteMany({}, (err, docs) => {
        if (err) {
          db.close();
          res.json('err');
          console.log(err)
        };
        if (docs.result.n > 0) {
          res.json('complete delete successful');
        } else {
          res.json('complete delete unsuccessful');
        }
        db.close();
      });
    });
  });

  app.route('/api/books/:id')
  .get(function(req, res) {
    var bookid = req.params.id;
    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.collection('books').find({
        _id: ObjectId(bookid)
      }, {
        title: 1,
        comments: 1
      }).toArray((err, docs) => {
        if (err) {
          res.json(err);
        }
        if (docs.length === 0) {
          res.json('no book exists');
        } else {
          res.json(docs);
        }
        db.close();
      });
    });
  })

  .post(function(req, res) {
    var bookid = req.params.id;
    var comment = req.body.comment;

    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.collection('books').findOneAndUpdate({
        _id: ObjectId(bookid)
      }, {
        $push: {
          comments: comment
        },
        $inc: {
          commentcount: 1
        }
      }, {
        returnOriginal: false
      }, (err, docs) => {
        if (err)
          console.log(err);
        delete docs.value["commentcount"];
        res.json(docs.value);
        db.close();
      });
    });
  })

  .delete(function(req, res) {
    var bookid = req.params.id;

    var filter = {
      _id: ObjectId(bookid)
    }

    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      db.collection('books').deleteOne(filter, (err, docs) => {
        if (err) {
          db.close();
          res.json(err);
          console.log(err)
        };
        if (docs.deletedCount === 0) {
          res.json('could not delete ');
        } else {
          res.json('delete successful');
        }
        db.close();
      });
    });
  });
};
