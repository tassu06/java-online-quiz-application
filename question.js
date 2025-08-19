const mongoose = require('mongoose');

// Question Schema
const questionSchema = new mongoose.Schema({
    chapter: String,
    question: String,
    options: [String],
    answer: String
});

// Create the model
const Question = mongoose.model("Question", questionSchema);

// Export it properly
module.exports = Question ;