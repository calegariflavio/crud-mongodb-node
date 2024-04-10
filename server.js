const express = require('express');
const multer = require('multer');
const GridFSBucket = require('mongodb').GridFSBucket;
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID; // For working with MongoDB IDs

const DB_URI = "mongodb+srv://flavioescalegari:199408@cluster0.lbnjm3k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your connection URI
const DATABASE_NAME = 'Cluster0'; // Replace with your database name
const COLLECTION_NAME = 'crud'; // Replace with your collection name

const app = express();
app.use(express.json());
app.use(cors());

// Multer configuration
const storage = multer.memoryStorage(); // Hold the file temporarily in memory 
const upload = multer({ storage: storage });

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

app.post('/data', upload.single('picture'), async (req, res) => {
  console.log("Incoming Request:", req.body, req.file);
    try {
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Process the image file (if uploaded)
        let pictureId = null;
        if (req.file) {
            const bucket = new GridFSBucket(db);
            const uploadStream = bucket.openUploadStream(req.file.originalname);
            uploadStream.id = req.file.id; 
            req.file.buffer.pipe(uploadStream);

            await new Promise((resolve, reject) => {
                uploadStream.on('finish', resolve);
                uploadStream.on('error', reject);
            });

            pictureId = uploadStream.id; 
        }

        // Updated data to include image reference
        const data = {
            ...req.body,
            picture: pictureId 
        };

        const result = await collection.insertOne(data);
        res.status(201).json({ message: 'Data created', id: result.insertedId }); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create data' });
    }
});
  
  // Read All (GET):
  app.get('/data', async (req, res) => {
    try {
      const db = client.db(DATABASE_NAME);
      const collection = db.collection(COLLECTION_NAME);
      const cursor = await collection.find().toArray(); 
      res.json(cursor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch data' });
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
  
  // Update (PUT by ID):
  app.put('/data/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body; 
  
    try {
      const db = client.db(DATABASE_NAME);
      const collection = db.collection(COLLECTION_NAME);
      const result = await collection.updateOne(
        { _id: ObjectID(id) },
        { $set: updateData } 
      );
  
      if (result.matchedCount > 0) {
        res.json({ message: 'Data updated' });
      } else {
        res.status(404).json({ error: 'Data not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update data' });
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