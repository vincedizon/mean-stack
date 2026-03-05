const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

const CONNECTION_STRING = "mongodb://localhost:27017";
const DATABASENAME = "MyDb";
let database;

async function start() {
  try {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    database = client.db(DATABASENAME);
    console.log("Connected to MongoDB!");
    app.listen(5038, () => console.log("API running on http://localhost:5038"));
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}

start();

// GET ALL BOOKS
app.get("/api/books/GetBooks", async (req, res) => {
  const result = await database.collection("Books").find({}).toArray();
  res.send(result);
});

// ADD BOOK
app.post("/api/books/AddBook", multer().none(), async (req, res) => {
  try {
    const numOfDocs = await database.collection("Books").countDocuments();
    const newBook = {
      id: String(numOfDocs + 1),
      title: req.body.title,
      desc: req.body.description,
      category: req.body.category || "General",
      rating: Number(req.body.rating) || 1,
      price: Number(req.body.price) || 0
    };
    await database.collection("Books").insertOne(newBook);
    res.json("Added Successfully");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// UPDATE BOOK
app.put("/api/books/UpdateBook", multer().none(), async (req, res) => {
  try {
    const { id, title, description, category, rating, price } = req.body;
    await database.collection("Books").updateOne(
      { id: id },
      {
        $set: {
          title: title,
          desc: description,
          category: category,
          rating: Number(rating),
          price: Number(price)
        }
      }
    );
    res.json("Updated Successfully");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// DELETE BOOK
app.delete("/api/books/DeleteBook", async (req, res) => {
  try {
    await database.collection("Books").deleteOne({ id: req.query.id });
    res.json("Deleted successfully!");
  } catch (e) {
    res.status(500).send(e.message);
  }
});