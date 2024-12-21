const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors package

const app = express();
const port = process.env.PORT || 5000; // Allow dynamic port for deployment

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for both localhost:3000 and 192.168.56.1:3000
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.56.1:3000'],
  methods: ['GET', 'POST', 'DELETE'], // Restrict allowed HTTP methods
}));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todolist';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Todo model
const TodoSchema = new mongoose.Schema({
  task: { type: String, required: true, trim: true }, // Added validation and trimming
  completed: { type: Boolean, default: false }, // Added completed field for task status
}, { timestamps: true }); // Include timestamps for created and updated at

const Todo = mongoose.model('Todo', TodoSchema);

// GET: Fetch all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST: Add a new todo
app.post('/api/todos', async (req, res) => {
  const { task } = req.body;

  if (!task || task.trim() === '') {
    return res.status(400).json({ error: 'Task is required and cannot be empty' });
  }

  try {
    const newTodo = new Todo({ task });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// DELETE: Remove a todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  try {
    await Todo.findByIdAndDelete(id);
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
