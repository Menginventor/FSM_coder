
var fileHandle;
var request = window.indexedDB.open("recentFileDB");

btnOpenFile = document.getElementById('openFile');
btnOpenFile.addEventListener('click', async () => {
  // Destructure the one-element array.
  [fileHandle] = await window.showOpenFilePicker();
  // Do something with the file handle.
  const file = await fileHandle.getFile();
   const contents = await file.text();
   console.log(contents);
   const obj = JSON.parse(contents);
   console.log(obj);
   stateLayer.destroyChildren();
   arrowLayer.destroyChildren();
   let stateNameArr = Object.keys(obj.state);

   for (let idx = 0;idx < stateNameArr.length;idx++){
        let stateName = stateNameArr[idx];
        addState(obj.state[stateName])
   }
   let arrowNameArr = Object.keys(obj.arrow);
    for (let idx = 0;idx < arrowNameArr.length;idx++){
        let arrowName = arrowNameArr[idx];
        createNewArrow(obj.arrow[arrowName])
    }


});
btnSaveFile = document.getElementById('saveFile');

btnSaveFile.addEventListener('click', async () => {
   saveFileFunc();
});

async function saveFileFunc(){
    console.log('saveFile');
    try {
        const fileHandle = await self.showSaveFilePicker({
          suggestedName: 'untitled',
          types: [
            {
              description: "Text file",
              accept: {'text/plain': ['.txt']},
              // ...
            },
          ],
        });
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
        }
        console.log(data)
        let writeContent = JSON.stringify(data, null, 4);
        console.log(writeContent);
        writeFile(fileHandle,writeContent).then(() => console.log("File saved!!!"));

      } catch (error) {
        console.error(error);
      }
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
    alert(`Key pressed ${keyName}`);
  }
}, false);