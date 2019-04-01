// Dependencies
const express = require("express"),
    router = express.Router(),
    db = require("../models");

// Retrieve all notes for an article (get route)
router.get("/getNotes/:id", (req, res) =>{
    db.Article
        .findOne({_id: req.params.id})
        .populate("notes")
        .then(results => res.json(results))
        .catch(err => res.json(err));
});

// Return single note (get route)
router.get("/getSingleNote/:id", (req, res) =>{
    db.Note
        .findOne({_id: req.params.id})
        .then(results => res.json(results))
        .catch(err => res.json(err));
});

// Create new note in the database (post route)
router.post("/createNote", (req, res)=>{
    let { title, body, articleId } = req.body;
    let note = {
        title,
        body
    };
    db.Note
        .create(note)
        .then( result => {
            db.Article
                .findOneAndUpdate({_id: articleId}, {$push:{notes: result._id}},{new:true}) //saving reference to note
                .then(data => res.json(result))
                .catch(err => res.json(err));
        })
        .catch(err => res.json(err));
});

// Delete a note (post route)
router.post("/deleteNote", (req, res) =>{
    let {articleId, noteId} = req.body;
    db.Note
        .remove({_id: noteId})
        .then(result => res.json(result))
        .catch(err => res.json(err));
});

module.exports = router;