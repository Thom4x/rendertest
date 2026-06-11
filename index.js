const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const path = require('path')
app.use(express.static(path.join(__dirname, 'dist')))

app.use(cors()) // se habilita el middleware cors para permitir solicitudes desde cualquier origen
app.use(morgan('tiny'))
app.use(express.json()) // se habilita el middleware express.json para parsear el cuerpo de las solicitudes JSON    


let notes = [
    {
        id: 1,
        content: "HTML is easy",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes/hola', (request, response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (req, res) => {// esto es un endpoint dinámico, el :id es un parámetro que se puede acceder a través de request.params.id
    const id = Number(req.params.id) // el id es un string,  por lo que hay que convertirlo a número para compararlo con los id de las notas
    console.log(id);
    const note = notes.find(note => note.id === id) // se busca la nota con el id que se ha pasado como parámetro

    if (note) {
        res.json(note) // si se encuentra la nota, se devuelve como respuesta
    } else {
        res.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id) // el id es un string,  por lo que hay que convertirlo a número para compararlo con los id de las notas
    notes = notes.filter(note => note.id !== id) // se filtran las notas para eliminar la nota con el id que se ha pasado como parámetro
    response.status(202).end()
})

app.post('/api/test', (request, response) => {
    const note = request.body // se obtiene el cuerpo de la petición, que es un objeto con las propiedades content e important
    console.log(request.headers);
    console.log(note);
    response.json(note) // se devuelve la nota como respuesta
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/notes', (request, response) => {
    const body = request.body

    if (!body.content) { // si el cuerpo de la petición no tiene la propiedad content, se devuelve un error 400 con un mensaje de error
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: Boolean(body.important) || false,
        id: generateId(),
    }

    notes = notes.concat(note)

    response.json(note)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint) // se habilita el middleware para manejar las rutas desconocidas, debe ir al final de todas las rutas

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)

