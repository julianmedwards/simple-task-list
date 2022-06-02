let db

function initDatabase(resolve, reject) {
    window.indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB

    window.IDBTransaction =
        window.IDBTransaction ||
        window.webkitIDBTransaction ||
        window.msIDBTransaction

    window.IDBKeyRange =
        window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

    if (!window.indexedDB) {
        window.alert(
            "Your browser doesn't support a stable version of IndexedDB."
        )
        reject()
    }

    let request = window.indexedDB.open('tasks', 1)
    request.onerror = function (event) {
        console.log(event)
        alert('Tasks could not be displayed!')
        reject()
    }

    request.onsuccess = function (event) {
        db = request.result
        console.log('success: ' + db)

        let taskArray = retrieveTasks()
        resolve(taskArray)
    }

    request.onupgradeneeded = function (event) {
        console.log('Upgrading database.')
        var db = event.target.result
        var objectStore = db.createObjectStore('task', {keyPath: 'id'})
    }
}

// Add a task to database, create and inject a DOM element, attaching
// delete event listener. Finally cycle form placeholder text.
function add() {
    let id = Date.now()
    let task = document.getElementById('todo').value

    request = db
        .transaction(['task'], 'readwrite')
        .objectStore('task')
        .add({id: id, task: task})

    request.onsuccess = function (event) {
        let newTask = buildTask(id, task)
        newTask.lastChild.addEventListener('click', del)

        changeFormPlaceholder()
    }

    request.onerror = function (event) {
        console.log(`Couldn't add task of id ${id} and task string ${task}`)
        alert("Couldn't add task!")
    }
}

// Select a random placeholder prompt for the task form, clear the form
// text and re-focus.
function changeFormPlaceholder() {
    let prompts = ["What's on your agenda?", 'Enter a task', "What's next?"]
    let len = prompts.length
    let prompt = prompts[Math.floor(Math.random() * len)]

    let formField = document.getElementById('todo')
    if (prompt != formField.getAttribute('placeholder')) {
        formField.setAttribute('placeholder', prompt)
    } else {
        changeFormPlaceholder()
    }

    document.querySelector('form.todo-form').reset()
    formField.focus()
}

// Delete task element from the database. If successful, animate and
// delete task from DOM.
function del() {
    let task = this.parentElement
    let taskId = Number(task.getAttribute('data-key'))

    let request = db
        .transaction(['task'], 'readwrite')
        .objectStore('task')
        .delete(taskId)

    request.onsuccess = function (event) {
        task.classList.add('disappear')
        task.ontransitionend = () => {
            task.remove()
        }
    }

    request.onerror = function (event) {
        alert("Couldn't delete task!")
    }
}

// Iterate through database, injecting elements for each. Return promised
// array of all created elements.
function retrieveTasks() {
    let objectStore = db.transaction(['task'], 'readonly').objectStore('task')
    let taskArray = []

    return new Promise(function (resolve) {
        objectStore.openCursor().onsuccess = function (event) {
            let cursor = event.target.result
            if (cursor) {
                id = cursor.value.id
                task = cursor.value.task
                taskEl = buildTask(id, task)
                taskArray.push(taskEl)

                cursor.continue()
            } else {
                resolve(taskArray)
            }
        }
    })
}

// Returns HTML object to be injected in the DOM for a task. ID attached
// as attribute to target tasks with the same text.
function buildTask(id, task) {
    let tasks = document.getElementById('tasks')
    let newTask = document.createElement('div')
    newTask.classList.add('task')
    newTask.setAttribute('data-key', id)
    let taskString = document.createElement('p')
    taskString.innerHTML = task

    let delBtn = document.createElement('div')
    delBtn.classList.add('btn', 'delete')
    let xIcon = document.createElement('i')
    xIcon.classList.add('bi', 'bi-x')

    tasks.prepend(newTask)
    newTask.append(taskString)
    newTask.append(delBtn)
    delBtn.append(xIcon)

    return newTask
}

changeFormPlaceholder()

// Initialize IndexedDB database and return array of any task elements
// which were created from storage.
let initialized = new Promise(function (resolve, reject) {
    initDatabase(resolve, reject)
})

// Attach event listeners to delete buttons of dynamically created
// task elements.
initialized.then(
    function (taskArray) {
        for (let i of taskArray) {
            let delBtn = i.lastChild
            delBtn.addEventListener('click', del)
        }
    },
    function (error) {
        console.log('Issue with database!')
    }
)
