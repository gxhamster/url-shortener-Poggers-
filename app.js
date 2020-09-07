const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { nanoid } = require('nanoid')
const monk = require('monk')
const yup = require('yup')
const path = require('path')

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

const notFoundPath = path.join(__dirname, './public/notFound.html')

// Go to url in database
app.get('/:id', async (req, res, next) => {
    const {id: slug} = req.params
    try {
        const url = await urls.findOne({ slug })
        if (url) {
            return res.redirect(url.url)
        } 

        return res.status(404).sendFile(notFoundPath)

    } catch {
        return res.status(404).sendFile(notFoundPath)
    }
})

// Make a new slug
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

// Delete a slug
app.delete('/url', async (req, res, next) => {
    let { slug, url } = req.body
    try {
        const exist = await urls.findOne({ slug })
        console.log(exist)
        if (exist) {
            await urls.remove({
                slug: slug,
                url: url
            })

            return res.json({
                message: `${slug} has been deleted 🍚`
            })
        } else {
            return res.json({
                message: `Cannot find ${slug} 🍘`
            })
        }
    } catch (error) {
        next(error)
    }

})

app.use((req, res, next) => {
    res.status(404).sendFile(notFoundPath)
})

app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status)
    } else {
        res.status(500)
    }
    res.json({
        message: error.message,
        stack: error.stack
    })
})

const port = process.env.PORT || 2300
app.listen(port, () => {
    console.log(`Listening to your mom on http://localhost:${port} 👱‍`)
})








