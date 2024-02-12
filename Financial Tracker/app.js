
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const index=require('./index.html')
const styles=require('./styles.html')
const script=require('./script.html')


const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/personal_finance', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const { date, category, amount } = req.body;
        const transaction = new Transaction({
            userId: req.user._id,
            date,
            category,
            amount
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User authentication routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'secret_key');
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'secret_key');
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
app.use(authenticateUser);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
