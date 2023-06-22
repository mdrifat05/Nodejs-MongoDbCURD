const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const port = 3010;

const app = express();
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/GovernmentDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

// Create a schema and model for the data
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  address: String,
  contact_details: String
}, { versionKey: false }); // Disable versioning

const User = mongoose.model('users', userSchema);

// Parse JSON bodies for this app
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Define a route to handle the form submission
app.post('/api/add', (req, res) => {
  console.log(req.body);
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    address: req.body.address,
    contact_details: req.body.contact_details
  });

  user.save()
    .then(() => {
      res.send('User saved successfully!');
      console.log('User saved successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error saving user to database.');
    });
});

// Define a route to get all users
app.get('/api/getAllUser', (req, res) => {
  User.find()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error retrieving users from database.');
    });
});

// Define a route to get user by ID
app.get('/api/getUser/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving user data.');
  }
});

// Update a user
app.put('/api/update/:id', (req, res) => {
  const userId = req.params.id;
  const updatedUser = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    address: req.body.address,
    contact_details: req.body.contact_details
  };

  User.findByIdAndUpdate(userId, updatedUser, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).send('User not found.');
      }
      res.send('User updated successfully!');
      console.log('User updated successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error updating user.');
    });
});

// Delete a user
app.delete('/api/delete/:id', (req, res) => {
  const userId = req.params.id;

  User.findByIdAndRemove(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send('User not found.');
      }
      res.send('User deleted successfully!');
      console.log('User deleted successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error deleting user.');
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
