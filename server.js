require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Question = require('./question');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});


// Connection event handlers
mongoose.connection.on('connected', () => {
    console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

// API route to get all questions
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
        console.log(`📊 Sent ${questions.length} questions`);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: error.message });
    }
});

// API route to get questions by chapter
app.get('/api/questions/:chapter', async (req, res) => {
    try {
        const questions = await Question.find({ chapter: req.params.chapter });
        res.json(questions);
        console.log(`📊 Sent ${questions.length} questions for chapter ${req.params.chapter}`);
    } catch (error) {
        console.error('Error fetching questions by chapter:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route for main quiz page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'quiz.html'));
});

// Route for biology lessons 
app.get('/biology_lessons.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'biology_lessons.html'));
});

// Catch-all route for other HTML files
app.get('*.html', (req, res) => {
    const fileName = req.params[0] + '.html';
    res.sendFile(path.join(__dirname, fileName), (err) => {
        if (err) {
            res.status(404).send(`
                <h1>📄 File Not Found</h1>
                <p>The file <strong>${fileName}</strong> doesn't exist.</p>
                <p>Available pages:</p>
                <ul>
                    <li><a href="/">🏠 Home (Quiz)</a></li>
                    <li><a href="/api/questions">📊 API - All Questions</a></li>
                    <li><a href="/api/questions/1">📊 API - Chapter 1 Questions</a></li>
                </ul>
            `);
        }
    });
});

// Basic API info route
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Quiz API Server is running!',
        endpoints: [
            'GET / - Quiz web interface',
            'GET /api/questions - Get all questions',
            'GET /api/questions/:chapter - Get questions by chapter'
        ]
    });
});
// Add this entire block to server.js

app.post('/api/submit', async (req, res) => {
    try {
        const { chapter, answers: userAnswers } = req.body;

        // Fetch the correct questions from the database
        const correctQuestions = await Question.find({ chapter: chapter });

        let score = 0;
        const total = correctQuestions.length;

        // Compare user answers with correct answers from the DB
        correctQuestions.forEach(question => {
            const questionText = question.question;
            const correctAnswer = question.answer; 
            const userAnswer = userAnswers[questionText];

            if (userAnswer && userAnswer === correctAnswer) {
                score++;
            }
        });
        
        // Send back the result
        res.json({
            score: score,
            total: total,
            feedback: "Thank you for completing the quiz!"
        });

    } catch (error) {
        res.status(500).json({ message: 'Error processing quiz results' });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api/questions`);
    console.log(`🌐 Web interface at http://localhost:${PORT}`);
});