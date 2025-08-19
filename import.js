// import.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Question = require('./question');

// --- CONFIGURATION ---
const MONGO_URI = 'mongodb://127.0.0.1:27017/quizapp';
const CSV_FILE_PATH = path.join(__dirname, 'questionschp1new1.csv'); // Using your new filename

// --- SCRIPT LOGIC ---
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connection successful.');
        // This will clear all old questions to ensure a fresh start
        return Question.deleteMany({}); 
    })
    .then(() => {
        console.log('🧹 Database cleared. Starting import...');
        importQuestions();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

function importQuestions() {
    const questionsToSave = [];

    fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
            // This object now EXACTLY matches your CSV column headers
            const newQuestion = {
                chapter: row.Chapter,       // Matches 'Chapter' column
                question: row.question,     // Matches 'question' column
                options: [row.option1, row.option2, row.option3, row.option4].filter(Boolean),
                answer: row.correctans      // Matches 'correctans' column
            };
            questionsToSave.push(newQuestion);
        })
        .on('end', () => {
            console.log(`...Read ${questionsToSave.length} questions from CSV file.`);
            
            if (questionsToSave.length > 0) {
                Question.insertMany(questionsToSave)
                    .then(() => {
                        console.log('✅ All questions have been successfully saved to the database!');
                    })
                    .catch(err => {
                        console.error('❌ Error saving questions to database:', err);
                    })
                    .finally(() => {
                        mongoose.connection.close();
                    });
            } else {
                console.log('🤷 No questions to import.');
                mongoose.connection.close();
            }
        });
}