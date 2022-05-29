let db

function initDatabase() {
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
    }

    let request = window.indexedDB.open('tasks', 1)
    request.onerror = function (event) {
        console.log(event)
        alert('Tasks could not be displayed!')
    }

    request.onsuccess = function (event) {
        db = request.result
        console.log('success: ' + db)
    }

    request.onupgradeneeded = function (event) {
        console.log('Upgrading database.')
        var db = event.target.result
        var objectStore = db.createObjectStore('task', {keyPath: 'id'})
    }
}
