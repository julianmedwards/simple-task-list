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

        console.log('retrieveTasks return: ')
        console.log(taskArray)

        console.log('resolving')
        resolve(taskArray)
    }

    request.onupgradeneeded = function (event) {
        console.log('Upgrading database.')
        var db = event.target.result
        var objectStore = db.createObjectStore('task', {keyPath: 'id'})
        resolve()
    }
}

function add() {
    let id = Date.now()
    let task = document.getElementById('todo').value

    request = db
        .transaction(['task'], 'readwrite')
        .objectStore('task')
        .add({id: id, task: task})

    request.onsuccess = function (event) {
        buildTask(id, task)
    }

    request.onerror = function (event) {
        console.log(`Couldn't add task of id ${id} and task string ${task}`)
        alert("Couldn't add task!")
    }
}

function del() {
    let task = this.parentElement
    let taskId = task.getAttribute('data-key')
    console.log(task)
    console.log(taskId)

    request = db
        .transaction(['task'], 'readwrite')
        .objectStore('task')
        .delete(taskId)

    request.onsuccess = function (event) {
        task.remove()
    }

    request.onerror = function (event) {
        alert("Couldn't delete task!")
    }
}

function retrieveTasks() {
    console.log('retrieving')

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

                console.log('Built task ' + taskArray[0])
                console.log(taskArray)

                cursor.continue()
            } else {
                console.log('retrieved')
                resolve(taskArray)
            }
        }
    })
}

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

let initialized = new Promise(function (resolve, reject) {
    initDatabase(resolve, reject)
})

// Wait for database initialization and retrieval/writing of stored tasks
// to dom before attaching event listeners to task delete buttons.
initialized.then(
    function (taskArray) {
        console.log('taskArray at initialized.then ')
        console.log(taskArray)
        let taskArrayDOM = document.querySelectorAll('div.task')
        console.log(taskArrayDOM)
        for (let i of taskArray) {
            let delBtn = i.lastChild
            delBtn.addEventListener('click', del)
        }
    },
    function (error) {
        console.log('Issue with database!')
    }
)
