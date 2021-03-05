require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./model/person')
app.use(cors())
app.use(express.static('build'))

morgan.token('body', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons)
        })
})

app.get('/info', (request, response) => {
    let total = persons.reduce((sum) => {
        return sum + 1
    }, 0)
    let time = new Date()
    response.send(`Phonebook has info for ${total} people <br><br> ${time}`)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response
                    .status(404)
                    .end()
            }
        })
        .catch(error => next(error))
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

/*app.post('/api/persons', (request, response) => {
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
})*/

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined) {
        return response
            .status(400)
            .json({error: 'name missing'})
    }

    if (body.number === undefined) {
        return response
            .status(400)
            .json({error: 'number missing'})
    }

    const person = new Person({name: body.name, number: body.number})

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
})


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response
            .status(400)
            .send({error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})