// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());

app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'index.html'));});
app.get('/login', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'login.html'));});
app.get('/dashboard', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));});
app.get('/solosession', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'solosession.html'));});
app.get('/groupstudy', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'groupstudy.html'));});
app.get('/analysis', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'analysis.html'));});
app.get('/planner', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'planner.html'));});


app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    db.run(
        'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
        [name, email, message],
        function (err) {
            if (err) {
                return console.error(err.message);
            }
            res.send(`
                <h1>Thank you, ${name}!</h1>
                <p>Your message has been received. We'll get back to you shortly.</p>
                <a href="/">Go back to the home page</a>
            `);
        }
    );
});

app.post('/ai', async (req, res) => {
    const { prompt } = req.body;
    try {
        console.log(prompt); // This should log the prompt from the request body
        const result = await ai(prompt);
        res.json({response : result.candidates[0].content.parts[0].text});
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
});

app.get('/api/data', (req, res) => {
    const data = {
        message: "Hello from the API!",
        date: new Date(),
    };
    res.json(data);
});




// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});






async function ai(prompt){
    
    const AIKEY = "AIzaSyDKQoRbIx09CVYL8hwHT1tJVVzzIS122Y4"

    return new Promise((f,r) => {

        fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + AIKEY + '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "contents": [{
                    "parts":[{"text": prompt}]
                    }]
            })
        })
        .then(a => a.json())
        .then(a => {
            f(a)
        })
        .catch(error => {
            f(false)
            console.error('Error:', error);  // handle errors
        });
    

    })


    
}