// Dependencies
const express = require("express"),
    cheerio = require("cheerio"),
    rp = require("request-promise"), 
    router = express.Router(),
    db = require("../models");

// Get route to scrape new articles
router.get("/newArticles", (req, res)=>{
    //options for object (request - promise)
    const options = {
        uri: "https://www.nytimes.com/section/us",
        transform: (body) => {
            return cheerio.load(body);
        }
    };
    // Calling DB to return articles
    db.Article
        .find({})
        .then((savedArticles) =>{
            // Create an array for saved article headlines
            let savedHeadLines = savedArticles.map(article => article.headline);
            // Request promise with options object
            rp(options)
            .then(($) =>{
                let newArticleArr = [];
                // Iterating over returned articles, and creating a newArticle object form the data
                $("#latest-panel article.story.theme-summary").each((i, element)=>{
                    let newArticle = new db.Article({
                        storyUrl: $(element).find(".story-body>.story-link").attr("href"),
                        headline: $(element).find("h2.headline").text().trim(),
                        summary: $(element).find("p.summary").text().trim(),
                        imgUrl: $(element).find("img").attr("src"),
                        byLine: $(element).find("p.byline").text().trim()
                    });
                    // Making sure newArticle contains storyURL
                    if (newArticle.storyUrl){
                        // Check to see if article is already saved, if not insert into array
                        if(!savedHeadLines.includes(newArticle.headline)){
                            newArticleArr.push(newArticle);
                        } 
                    }
                });

                // Adding new articles to DB
                db.Article
                    .create(newArticleArr)
                    .then(result => res.json({count: newArticleArr.length}))
                    .catch(err => {});
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

module.exports = router;