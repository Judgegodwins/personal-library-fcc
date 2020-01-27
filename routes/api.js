/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose')
const DB = process.env.DB;

const Book = require('../schema.js');
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

mongoose.connect(DB, {useNewUrlParser: true}, (err, db) => {
  if(!err) console.log('successfully connected')
})

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    
      Book.find({}).select({__v: 0, comments: 0}).exec((err, doc) => {
        res.json(doc);
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(title !== '') {
              //response will contain new book object including atleast _id and title
        let book = new Book({
          title: title,
          comments: [],
          commentcount: 0
        })

        book.save((err, doc) => {
          delete doc.__v;
          if(!err) res.json({title: doc.title, comments: doc.comments, _id: doc._id});
        })  
      } else {
        res.send('missing title');
      }
      
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.remove({}, (err) => {
        if(!err) {
          res.send('complete delete successful');
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    
      Book.findById(bookid).select({__v: 0, commentcount: 0}).exec((err, doc) => {
        if(doc) {
          res.json({_id: doc._id, title: doc.title, comments: doc.comments});
        } else {
          res.send('no book exists')
        }
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      console.log(comment)
      Book.findById(bookid).select({__v: 0}).exec((err, book) => {

        book.comments.push(comment);
        book.commentcount += 1;
        book.save((err, doc) => {
          res.json({_id: doc._id, title: doc.title, comments: doc.comments});
        })
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(bookid, (err, doc) => {
        if(!err) res.send('delete successful');
      })
    });
  
};
