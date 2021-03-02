const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(cors())

let persons = [

    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    }, {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    }, {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    }, {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

morgan.token('body', function (req, res) {
    return JSON.stringify(req.body)
})


app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    let total = persons.reduce((sum) => {
        return sum + 1
    }, 0)
    let time = new Date()
    response.send(`Phonebook has info for ${total} people <br><br> ${time}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response
            .status(404)
            .end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response
        .status(204)
        .end()
})

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response
            .status(400)
            .json({error: 'name missing'})
    }

    if (!body.number) {
        return response
            .status(400)
            .json({error: 'number missing'})
    }

    let names = persons.map(name => name.name);
    if (names.includes(body.name)) {
        return response
            .status(400)
            .json({error: 'name must be unique'})
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})