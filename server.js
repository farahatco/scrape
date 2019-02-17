var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");



// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/farahattest", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {

  db.interview.count().then(function(cnt){
    if(cnt >0){
     db.interview.deleteMany({}).then(function(e){
       console.log(e)
     });
    }
  });
  // First, we grab the body of the html with axios
  axios.get("https://www.onlineinterviewquestions.com/node-js-interview-questions").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    //console.log(response)
    var $ = cheerio.load(response.data);

      $("div").each(function(i, element) {
      var result = {};
      result.question = $(this).children("h3").text();
      result.answer = $(this).children("div").text(); 
       // console.log(result.answer)
      
      // console.log("cnt", cnt)

     

          db.interview.create(result)
        .then(function(dbInterview) {

        })
        .catch(function(err) {
       // console.log(err);
        });
    
  
  });

    // Send a message to the client
    res.send("scrape complete");
  });
});
app.get("/cnt",function(req,res){

db.interview.count().then(function(cn){
 if(cn >0){
  console.log("many")
  db.interview.deleteMany({}).then(function(e){
    console.log("many then ")
    console.log(e)
  });
  console.log("deleted")
 }
else{
console.log("start counting")
console.log(cn)
console.log("ending result")
}
});
res.send("cnt");


})
    
    
app.get("/",function(req,res){
  res.render("home")
})
    app.get("/result",function(req,res){
      db.interview.find({})
        .then(function(dbInterview) {
          // If we were able to successfully find Articles, send them back to the client
          //res.json(dbArticle);
          res.render("result",{result : dbInterview})
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        })
         
})
// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.interview.find({})
    .then(function(dbInterview) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbInterview);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.interview.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbInterview) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbInterview);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.interview.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbInterview) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbInterview);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
