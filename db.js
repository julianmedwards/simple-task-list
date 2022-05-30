let db;

function initDatabase() {
    window.indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;

    window.IDBTransaction =
        window.IDBTransaction ||
        window.webkitIDBTransaction ||
        window.msIDBTransaction;

    window.IDBKeyRange =
        window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    if (!window.indexedDB) {
        window.alert(
            "Your browser doesn't support a stable version of IndexedDB."
        );
    }

    let request = window.indexedDB.open("tasks", 1);
    request.onerror = function (event) {
        console.log(event);
        alert("Tasks could not be displayed!");
    };

    request.onsuccess = function (event) {
        db = request.result;
        console.log("success: " + db);
    };

    request.onupgradeneeded = function (event) {
        console.log("Upgrading database.");
        var db = event.target.result;
        var objectStore = db.createObjectStore("task", { keyPath: "id" });
    };
}

function add() {
    let id = Date.now();
    let task = document.getElementById("todo").value;

    request = db
        .transaction(["task"], "readwrite")
        .objectStore("task")
        .add({ id: id, task: task });

    request.onsuccess = function (event) {
        let tasks = document.getElementById("tasks");
        let newTask = document.createElement("div");
        newTask.classList.add("task");
        let taskString = document.createElement("p");
        taskString.innerHTML = task;

        let delBtn = document.createElement("div");
        delBtn.classList.add("btn", "delete");
        let xIcon = document.createElement("i");
        xIcon.classList.add("bi", "bi-x");

        tasks.prepend(newTask);
        newTask.append(taskString);
        newTask.append(delBtn);
        delBtn.append(xIcon);
    };

    request.onerror = function (event) {
        console.log(`Couldn't add task of id ${id} and task string ${task}`);
        alert("Couldn't add task!");
    };
}

initDatabase();

// document.getElementById("submit").addEventListener("click", add);
