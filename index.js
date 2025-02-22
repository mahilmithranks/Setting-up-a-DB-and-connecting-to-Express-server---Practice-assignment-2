const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');


dotenv.config();


console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const User = require('./models/schema');


app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to database'))
    .catch((error) => {
        console.error('Error connecting to database:', error.message);
        process.exit(1);
    });


app.get('/', (req, res) => {
    res.sendFile(resolve(__dirname, 'pages/index.html'));
});


app.post('/api/users', async (req, res) => {
  console.log('Received Request Body:' , req.body);
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: ['Email already exists']
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});