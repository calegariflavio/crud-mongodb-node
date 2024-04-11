const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/') // File storage destination
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname) // Use original file name
  }
})

// Multer instance
const upload = multer({ storage: storage });

//Database Connection
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID; // For working with MongoDB IDs

const DB_URI = "mongodb+srv://flavioescalegari:199408@cluster0.lbnjm3k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your connection URI
const DATABASE_NAME = 'Cluster0'; // Replace with your database name
const COLLECTION_NAME = 'crud'; // Replace with your collection name

const client = new MongoClient(DB_URI);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectToDatabase();

// --- CRUD Routes ---


app.post('/data', upload.single('file'), async (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }

  try {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const doc = {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      imagePath: '/uploads/' + req.file.filename 
    };

    const insertResult = await collection.insertOne(doc);

    res.send('File uploaded and data saved successfully');

  } catch (error) { 
    console.error("Error saving data to database:", error);
    next(error); // Pass error for appropriate handling
  }
});
  
  // Read All (GET):
  // Fetch all data
  app.get('/data', async (req, res) => {
    try {
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);
        const data = await collection.find().toArray();
        res.json(data); 
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
    }
  });
  
  // Read One (GET by ID):
  app.get('/data/:id', async (req, res) => {
    const id = req.params.id; 
  
    try {
      const db = client.db(DATABASE_NAME);
      const collection = db.collection(COLLECTION_NAME);
      const result = await collection.findOne({ _id: ObjectID(id) }); 
  
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Data not found' }); 
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  
  app.put('/data/:id', upload.single('file'), async (req, res) => {
    const file = req.file;
    const { id } = req.params;

    try {
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const updateData = {
            name: req.body.name,
            age: req.body.age,
            gender: req.body.gender
        };
        if (file) {
            updateData.imagePath = file.path;
        }

        const updateResult = await collection.updateOne(
            { _id: ObjectID(id) },
            { $set: updateData }
        );

        if (updateResult.modifiedCount > 0) {
            res.send("Data updated successfully");
        } else {
            res.status(404).send("Data not found");
        }
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Error updating data");
    }
});
  
  // Delete (DELETE by ID):
  app.delete('/data/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const db = client.db(DATABASE_NAME);
      const collection = db.collection(COLLECTION_NAME);
      const result = await collection.deleteOne({ _id: ObjectID(id) });
  
      if (result.deletedCount > 0) {
        res.json({ message: 'Data deleted' });
      } else {
        res.status(404).json({ error: 'Data not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete data' });
    }
  });

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});