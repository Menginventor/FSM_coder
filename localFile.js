

var fileHandle;
var DBOpenRequest = window.indexedDB.open("recentFileDB");
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;

var db;
 DBOpenRequest.onerror = function(event) {

    alert('Error loading database.');
  };

DBOpenRequest.onsuccess = function(event) {
    console.log('Database initialised.');
    // store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;
    // Run the displayData() function to populate the task list with all the to-do list data already in the IDB

};

DBOpenRequest.onupgradeneeded = function(event) {
    alert('DB upgraded!!')
    let db = event.target.result;

    db.onerror = function(event) {
      alert('Error loading database.');
    };

    // Create an objectStore for this database

    let objectStore = db.createObjectStore("recentFile", { keyPath: "fileName" });

    // define what data items the objectStore will contain

    objectStore.createIndex("time", "time", { unique: false });
    objectStore.createIndex("fileHandle", "fileHandle", { unique: false });

};

const btnRecentFile = document.getElementById('recentFile');

btnRecentFile.addEventListener('click', async () => {
    console.log('Recent file clicked');
    const dropdown = document.getElementById('recentFileDrop');
    dropdown.innerHTML = '';
    let objectStore = db.transaction('recentFile').objectStore('recentFile');
    let html = '';
    objectStore.index('time').openCursor(null, 'prev').onsuccess = function(event) {
        let cursor = event.target.result;
        // if there is still another cursor to go, keep runing this code
        if(cursor) {
            console.log(cursor);
            const fileHandle = cursor.value.fileHandle;
            const fileName = cursor.value.fileName;
            console.log(fileName)
            dropdown.innerHTML += '<a onclick = \"openRecent(\''+fileName+'\')\" href="#" class=\"dropdown-item\">'+fileName+'</a>'
            cursor.continue();

        }
        else{
             dropdown.innerHTML += '<a onclick = "clearDB()" href="#" class="dropdown-item">Clear</a>';
        }
    }
});

const btnOpenFile = document.getElementById('openFile');
btnOpenFile.addEventListener('click', async () => {
  // Destructure the one-element array.
  [pickFileHandle] = await window.showOpenFilePicker();
  // Do something with the file handle.
  openFileFunc(fileHandle)

});
async function openFileFunc(pickFileHandle){
    let  permission = await verifyPermission(pickFileHandle, true);
    console.log(permission);
  if( permission) {
                console.log('permission Granted, reading file: ')
        const file = await pickFileHandle.getFile();
        const contents = await file.text();
        console.log(contents);
        const obj = JSON.parse(contents);
        console.log(obj);
        stateLayer.destroyChildren();
        arrowLayer.destroyChildren();
        let stateNameArr = Object.keys(obj.state);
        globalCode = obj.globalCode;
        for (let idx = 0;idx < stateNameArr.length;idx++){
            let stateName = stateNameArr[idx];
            addState(obj.state[stateName])
        }
        let arrowNameArr = Object.keys(obj.arrow);
        for (let idx = 0;idx < arrowNameArr.length;idx++){
            let arrowName = arrowNameArr[idx];
            createNewArrow(obj.arrow[arrowName])
        }
          tr.nodes([]);
          selectedArrow = null;
           codeHeaderEle.innerText = 'Global scope';
           editor.session.setValue(globalCode,-1);

        fileHandle = pickFileHandle;
    }
    else {
                alert('permission refused')
    }
}

btnSaveFile = document.getElementById('saveFile');
btnSaveAs = document.getElementById('saveAs');
btnSaveFile.addEventListener('click', async () => {
   saveFileFunc();
});
btnSaveAs.addEventListener('click', async () => {
   saveAsFunc();
});

async function saveFileFunc(){
    console.log('saveFile');

    try {
        if (fileHandle == null){
            console.log('Save new file');
            fileHandle = await self.showSaveFilePicker({
                suggestedName: 'Untitled-FSM',
                types: [
                    {
                        description: "Text file",
                        accept: {'text/plain': ['.txt']},
                        // ...
                    },
                ],
            });
        }


        const writeFile = async (fileHandle, contents) => {
            // Create a FileSystemWritableFileStream to write to.
            const writable = await fileHandle.createWritable();
            // Write the contents of the file to the stream.
            await writable.write(contents);
            // Close the file and write the contents to disk.
            await writable.close();
        };
        // write file

        let data = {};
        data.state = {};
        data.arrow = {};
        data.globalCode = globalCode;
        for (let idx = 0; idx < stateLayer.children.length; idx++){
            let child = stateLayer.children[idx]
            if (child.name() == 'state'){

                console.log(child.state_text.text())
                console.log(child.x());
                console.log(child.y());
                console.log(child.radius());
                let stateName = child.state_text.text();
                data.state[stateName] = {};
                data.state[stateName].text = stateName;
                data.state[stateName].x = child.x();
                data.state[stateName].y = child.y();
                data.state[stateName].radius = child.radius();
                data.state[stateName].code = child.code;

            }

        }
        for (let idx = 0; idx < arrowLayer.children.length; idx++){
            let child = arrowLayer.children[idx]
            console.log(child);
            console.log(child.srcState);
            console.log(child.srcState.state_text);
            console.log(child.srcState.state_text.text());
            let srcStateIdx = child.srcState.index;
            let dstStateIdx = child.dstState.index;
            let points = child.points();
            data.arrow[idx] = {};
            data.arrow[idx].srcStateIdx = srcStateIdx;
            data.arrow[idx].dstStateIdx = dstStateIdx;
            data.arrow[idx].points = points;
            data.arrow[idx].code = child.code;
        }
        console.log(data)
        let writeContent = JSON.stringify(data, null, 4);
        console.log(writeContent);
        writeFile(fileHandle,writeContent).then(() => console.log("File saved!!!"));
        addRecentFilePath(fileHandle);
        console.log(fileHandle);
      } catch (error) {
        console.error(error);
      }
}

async function saveAsFunc(){
    console.log('saveFile');

    try {

            console.log('Save new file');
            let pickFileHandle = await self.showSaveFilePicker({
                suggestedName: 'Untitled-FSM',
                types: [
                    {
                        description: "Text file",
                        accept: {'text/plain': ['.txt']},
                        // ...
                    },
                ],
            });



        const writeFile = async (pickFileHandle, contents) => {
            // Create a FileSystemWritableFileStream to write to.
            const writable = await pickFileHandle.createWritable();
            // Write the contents of the file to the stream.
            await writable.write(contents);
            // Close the file and write the contents to disk.
            await writable.close();
        };
        // write file

        let data = {};
        data.state = {};
        data.arrow = {};
        data.globalCode = globalCode;
        for (let idx = 0; idx < stateLayer.children.length; idx++){
            let child = stateLayer.children[idx]
            if (child.name() == 'state'){

                console.log(child.state_text.text())
                console.log(child.x());
                console.log(child.y());
                console.log(child.radius());
                let stateName = child.state_text.text();
                data.state[stateName] = {};
                data.state[stateName].text = stateName;
                data.state[stateName].x = child.x();
                data.state[stateName].y = child.y();
                data.state[stateName].radius = child.radius();
                data.state[stateName].code = child.code;

            }

        }
        for (let idx = 0; idx < arrowLayer.children.length; idx++){
            let child = arrowLayer.children[idx]
            console.log(child);
            console.log(child.srcState);
            console.log(child.srcState.state_text);
            console.log(child.srcState.state_text.text());
            let srcStateIdx = child.srcState.index;
            let dstStateIdx = child.dstState.index;
            let points = child.points();
            data.arrow[idx] = {};
            data.arrow[idx].srcStateIdx = srcStateIdx;
            data.arrow[idx].dstStateIdx = dstStateIdx;
            data.arrow[idx].points = points;
            data.arrow[idx].code = child.code;
        }
        console.log(data)
        let writeContent = JSON.stringify(data, null, 4);
        console.log(writeContent);
        writeFile(pickFileHandle,writeContent).then(() => console.log("File saved!!!"));
        addRecentFilePath(pickFileHandle);
        console.log(pickFileHandle);
        fileHandle = pickFileHandle
      } catch (error) {
        console.error(error);
      }
}

async function verifyPermission(fileHandle, readWrite) {
  const options = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}

async function getNewFileHandle() {
  const options = {
    types: [
      {
        description: 'Text Files',
        accept: {
          'text/plain': ['.txt'],
        },
      },
    ],
  };
  const handle = await window.showSaveFilePicker(options);
  return handle;
}
async function writeFile(fileHandle, contents) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
}
document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (keyName === 'Control') {
    // do not alert when only Control key is pressed.
    return;
  }

  if (event.ctrlKey) {
    // Even though event.key is not 'Control' (e.g., 'a' is pressed),
    // event.ctrlKey may be true if Ctrl key is pressed at the same time.
    //alert(`Combination of ctrlKey + ${keyName}`);
    if (keyName == 's'){
        event.preventDefault();
        alert('Saved');
         saveFileFunc();
    }


  } else {
    //alert(`Key pressed ${keyName}`);
  }
}, false);







// open a read/write db transaction, ready for adding the data

// you would then go on to do something to this database
// via an object store

// etc.

function addRecentFilePath(fileHandle){
    let transaction = db.transaction("recentFile",'readwrite');

    // report on the success of opening the transaction
    transaction.oncomplete = event => {
      alert('transaaction complete');
    };

    transaction.onerror = event => {
      alert('transaction error');
    };

    let newItem = [
        {fileName:fileHandle.name, time: Date.now(), fileHandle: fileHandle}
      ];
        let objectStore = transaction.objectStore("recentFile");
     let objectStoreRequest = objectStore.put(newItem[0]);
        objectStoreRequest.onsuccess = function(event) {
        alert('objectStoreRequest onsuccess');
    }
}


function displayData() {
    // first clear the content of the task list so that you don't get a huge long list of duplicate stuff each time
    //the display is updated.


    // Open our object store and then get a cursor list of all the different data items in the IDB to iterate through
    let objectStore = db.transaction('recentFile').objectStore('recentFile');
    objectStore.openCursor().onsuccess = function(event) {
      let cursor = event.target.result;
        // if there is still another cursor to go, keep runing this code
        if(cursor) {
            console.log(cursor);
            const fileHandle = cursor.value.fileHandle

            console.log(fileHandle);

            readFile(fileHandle);

            cursor.continue();
        }
    }
}

async function openRecent(fileName){
    console.log('open recent '+ fileName);
    let objectStore = db.transaction('recentFile','readwrite').objectStore('recentFile');
    let objectStoreRequest  = objectStore.get(fileName);
    objectStoreRequest.onsuccess = function(event) {
        console.log(objectStoreRequest.result);
        let fileHandle = objectStoreRequest.result.fileHandle;
        openFileFunc(fileHandle)

      };

}
async function readFile(fileHandler) {
    if( await verifyPermission(fileHandler, false)) {
        console.log('permission Granted, reading file: ')
        const file = await fileHandler.getFile();
        const contents = await file.text();

        console.log(contents)
    } else {
        console.log('permission refused')
    }

}

function clearDB(){
    console.log('Clear DB');
    let objectStore = db.transaction('recentFile','readwrite').objectStore('recentFile');
    objectStore.clear();
}