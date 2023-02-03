const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(req, res, next) {
    const { username } = req.headers;

    const user = users.find((user) => user.username === username)

    
    if (!user) {
        res.status(404).json({ error: "This user don't exist" })
    }
    
    req.user = user;

    return next();

};

app.post("/users", (req, res) => {
    const { name, username } = req.body;

    const isUsernameTaken = users.some((user) => user.username === username)

    if (isUsernameTaken) {
        return res.status(400).json({ error: "This username is already taken" })
    }
    
    const user = {
        id: uuidv4(),
        name,
        username,
        todos: [],
    }
    
    users.push(user)

    console.log(user)

    res.status(201).json(user)
})

app.get("/todos", checksExistsUserAccount, (req, res) => {
    const { user } = req;

    console.log(user.todos)
    
    res.json(user.todos)
})

app.post("/todos", checksExistsUserAccount, (req, res) => {
    const { user } = req;
    const { title, deadline } = req.body;

    const newUserToDo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date(),
    }

    user.todos.push(newUserToDo)

    console.log(newUserToDo)

    res.status(201).json(newUserToDo)
})

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
    const { user } = req;
    const { title, deadline } = req.body;
    const { id } = req.params;

    const toDoToEdit = user.todos.find((todo) => todo.id === id);

    if(!toDoToEdit) {
        res.status(404).json({ error: "The ToDo you're trying to change don't exist" })
    }

    toDoToEdit.title = title
    toDoToEdit.deadline = new Date(deadline)

    console.log(toDoToEdit)

    res.json(toDoToEdit)
})

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const todoToChangeStatus = user.todos.find((todo) => todo.id === id)

    if (!todoToChangeStatus) {
        res.status(404).json({ error: "The ToDo you're trying to change don't exist" })
    }

    todoToChangeStatus.done = true;

    res.send(todoToChangeStatus);

    console.log(user.todos)
})

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
        const { user } = req;
        const { id } = req.params;

        const checkIfToDoExists = user.todos.some((todo) => todo.id === id)

        if (!checkIfToDoExists) {
            return res.status(404).json({ error: "The ToDo was not found." })
        }

        const toDosListWithoutTheDeletedOne = user.todos.filter((todo) => todo.id !== id);
        user.todos = toDosListWithoutTheDeletedOne

        res.status(204).send()

        console.log(checkIfToDoExists)
})

module.exports = app;