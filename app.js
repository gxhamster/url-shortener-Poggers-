const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { nanoid } = require('nanoid')
const monk = require('monk')
const yup = require('yup')

require('dotenv').config()

// Connect to databse
const db = monk(process.env.MONGO_URI)
const urls = db.get('urls')
urls.createIndex({slug: 1}, {unique: true})

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.static('./public'))

// Validation schema
const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]+$/i),
    url: yup.string().trim().url().required()
})

// console.log(process.env.NODE_VERSION)

app.post('/url', async (req, res, next) => {
    let { slug, url } = req.body
    
    try {
        await schema.validate({
            slug, 
            url
        })

        if (!slug) {
            slug = nanoid(5)
        } else {
            const existing = await urls.findOne({ slug })
            if (existing) {
                throw new Error('Slug is already in use 🍤')
            }
        }

        slug = slug.toLowerCase()
        const newUrl = {
            slug,
            url
        }

        const created = await urls.insert(newUrl)
        res.json(created)

    } catch (error) {
        next(error)
    }
})

const port = process.env.PORT || 2300
app.listen(port, () => {
    console.log(`Listening to your mom on http://localhost:${port} 👱‍`)
})








