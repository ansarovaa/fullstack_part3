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
    Person
        .find({})
        .then(persons => {
            response.send(`Phonebook has info for ${persons.length} people <br><br> ${new Date()}`)
        })
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

app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndRemove(request.params.id)
        .then(result => {
            response
                .status(204)
                .end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({name: body.name, number: body.number})

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {body} = request

    return Person
        .findOne({_id: request.params.id})
        .then((personToBeUpdate) => {
            const person = personToBeUpdate
            person.name = body.name
            person.number = body.number

            person
                .save()
                .then((savedPerson) => {
                    response.json(savedPerson.toJSON())
                })
                .catch((error) => next(error))
        })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response
            .status(400)
            .send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response
            .status(400)
            .json({error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})