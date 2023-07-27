const express = require("express");
const ejs = require("ejs");
const app = express();
const port = process.env.PORT || 8000;
let intial_path = require("path").join(__dirname, "public");
let Youtuber = require("./models/youtuber-model");

require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(intial_path));

// Connecting the database
const mongoose = require("mongoose");
const fs=require("fs");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Function to insert data from the JSON file into the database (Will run only at the time of database setup)
async function insertDataToDB() {
    try {
      // Read the JSON file
      const rawData = fs.readFileSync("./youtubers.json");
      const data = JSON.parse(rawData);
  
      // Insert the data into the database
      await Youtuber.insertMany(data);
      console.log("Data inserted successfully into the database!",data);
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  }
  
// Call the function to insert data into the database
// Uncomment it at first to insert all the data into database and then remove this call 
// and you can delete the function and youtubers.json file afterwards
// insertDataToDB();

// Routes
app.get("/", async (req, res) => {
  try {
    const youtubers = await Youtuber.find({}); // Fetch all YouTubers from the database
    res.render("home", {
      youtubers: youtubers, // Pass the fetched data to the EJS view
    });
  } catch (err) {
    console.error("Error fetching YouTubers:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", (req, res) => {
    // Get the data from the request body
    const { category, name, birthday, totalViews, link } = req.body;

    // Create a new instance of the Youtuber model with the data
    const newYoutuber = new Youtuber({
      category,
      name,
      birthday,
      totalViews,
      link,
    });

    // Save the new YouTuber to the database
    newYoutuber.save().then(()=>{
        // Redirect back to the home page or show a success message
        res.redirect("/");
    }).catch(err=>{
        console.error("Error adding YouTuber:", err);
        res.status(500).send("Internal Server Error");
    })    
});

// Listening on port
app.listen(port, () => {
  console.log("Listening at port", port);
});
