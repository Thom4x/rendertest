require('dotenv').config()
const express = require('express')
const Note = require('./models/note')

const app = express()

let notes = []

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)
app.use(express.static('dist'))
app.use(express.json())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then((notes) => {
        console.log("Notas encontradas:", notes);
        response.json(notes)
    }).catch((error) => {
        console.error("Error al obtener las notas:", error);
        next(error) // Pasa el error al manejador de errores
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then((note) => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        }).catch(error => {
            next(error)
        })
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body

    if (body.content === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then((savedNote) => {
            response.json(savedNote)
        }).catch((error) => {
            next(error)
        })
})

app.delete('/api/notes/:id', (request, response) => {
    //const id = request.params.id
    //notes = notes.filter((note) => note.id !== id)
    //response.status(204).end()
    Note.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    //const body = request.body
    const { content, important } = request.body

    Note.findByIdAndUpdate(
        request.params.id,
        { content, important },
        { new: true, runValidators: true, context: 'query' })

        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

// Middleware para manejar rutas desconocidas
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Middleware para manejar solicitudes que resulten en errores
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})