const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const { randomUUID } = require('crypto');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = []
let exercises = []

app.post('/api/users', function(req, res) {
  const { username } = req.body

  if (!username) {
    return res.json({ error: 'invalid username' })
  }

  const newUser = {
    username,
    _id: randomUUID()
  }
  users.push(newUser)

  res.json(newUser);
})

app.get('/api/users', function(req, res) {
  res.json(users);
})

app.post('/api/users/:_id/exercises', function(req, res) {
  const { description, duration } = req.body
  const { _id } = req.params
  const dateStr = req.body.date
  let date

  if (!dateStr) {
    date = new Date()
  } else {
    if (!isNaN(dateStr)) {
      date = new Date(parseInt(dateStr))
    } else {
      date = new Date(dateStr)
    }
  }

  if(!description) {
    res.json("You need to fill the description");
  }

  const user = users.find(user => user._id === _id)

  const newExercise = {
    username: user.username,
    description: description,
    duration: Number(duration),
    date: date.toDateString(),
    _id: user._id
  }
  exercises.push(newExercise)

  res.json(newExercise)
})

app.get('/api/users/:_id/logs', function(req, res) {
  const { _id } = req.params
  const { from, to, limit } = req.query
  const user = users.find(user => user._id === _id)
  const userExercises = exercises.filter(ex => ex._id === _id)
  let userExResult = [...userExercises]

  if (from || to) {
    userExResult = userExResult.filter(ex => {
      const fromDate = new Date(from) == 'Invalid Date' ? new Date(0) : new Date(from);
      const toDate = new Date(to) == 'Invalid Date' ? new Date() : new Date(to);

      return fromDate < new Date(ex.date) && new Date(ex.date) < toDate ? true : false;
    })
  }

  if (limit) {
    userExResult = userExResult.slice(0, Number(limit))
  }

  const userLogs = {
    ...user,
    count: userExResult.length,
    log: userExResult
  }

  res.json(userLogs)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
