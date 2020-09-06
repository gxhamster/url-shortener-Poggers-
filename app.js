const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { nanoid } = require('nanoid')
const monk = require('monk')

require('dotenv').config()

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('commmon'))
app.use(express.json())
app.use(express.static('./public'))


const port = process.env.PORT || 2300
app.listen(port, () => {
    console.log(`Listening to your mom on port:${port} 👱‍`)
})

