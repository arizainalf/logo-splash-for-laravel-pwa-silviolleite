const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// View engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Static files
app.use('/output', express.static(path.join(__dirname, 'public/output')))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Routes
const generatorRoutes = require('./routes/generator')
app.use('/', generatorRoutes)

app.listen(port, () =>
  console.log(`✅ Server running at http://localhost:${port}`)
)
