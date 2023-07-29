require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
require('./connectmongo');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection settings
const mongoURI = process.env.DATABASE;
const dbName = 'quotes_db';
const collectionName = 'quotes';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a MongoDB client
const client = new mongodb.MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to the MongoDB server
client.connect((err) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }

  console.log('Connected to MongoDB successfully!');

  // Create a reference to the database and collection
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Endpoint to add a new quote to the database
  app.post('/addquote', (req, res) => {
    const { author, quote } = req.body;
    
    if (!author || !quote) {
      return res.status(400).json({ message: 'Author and quote are required fields.' });
    }

    // Insert the quote into the database
    collection.insertOne({ author, quote }, (err, result) => {
      if (err) {
        console.error('Error inserting quote into database:', err);
        return res.status(500).json({ message: 'Error adding quote. Please try again later.', error: err });
      }

      console.log('Quote added successfully:', result.insertedId);
      return res.status(200).json({ message: 'Quote added successfully!' });
    });
  });

  // Endpoint to fetch all quotes from the database
  app.get('/quotes', (req, res) => {
    // Fetch all quotes from the collection
    collection.find({}).toArray((err, quotes) => {
      if (err) {
        console.error('Error fetching quotes from database:', err);
        return res.status(500).json({ message: 'Error fetching quotes. Please try again later.' });
      }

      return res.status(200).json(quotes);
    });
  });

  // Start the server
  app.listen(3000, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
});
