const express = require('express')
const morgan = require('morgan')
const logger = require('./middlewares/loger')
const cors = require('cors')
const app = express()
app.use(cors()) // se habilita el middleware cors para permitir solicitudes desde cualquier origen
app.use(express.json())

morgan.token('body', (req) => {
    return JSON.stringify(req.body) // se convierte el cuerpo de la petición a una cadena JSON para que se pueda mostrar en los logs
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')) // se configura morgan para que muestre el método, la URL, el estado, el tamaño de la respuesta, el tiempo de respuesta y el cuerpo de la petición en los logs

//app.use(logger)


let phoneBook = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]



app.get('/api/persons', (request, response) => {
    response.json(phoneBook)
})

app.get('/info', (request, response) => {
    const getDate = new Date()
    const formatoDate = getDate.toString();
    response.send(`Phonebook has info for ${phoneBook.length} people<br>${formatoDate}`);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = phoneBook.find(userid => userid.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).json({ error: "Missing.." })
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const initialLength = phoneBook.length

    phoneBook = phoneBook.filter(usr => usr.id !== id)

    if (phoneBook.length !== initialLength) {
        response.status(202).end()
    } else {
        response.status(404).json({ error: "ID Not found.." })
    }
})

const generateId = () => {
    const random = Math.floor(Math.random() * 1001);
    return random
}


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const newObject = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    if (phoneBook.find(usr => usr.name === newObject.name)) {
        return response.status(400).json({
            error: 'This person is already added'
        })
    }
    phoneBook = phoneBook.concat(newObject)
    response.json(newObject)

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log("Server running in", PORT);

