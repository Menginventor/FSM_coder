  function writeMessage(message) {
text.text(message);
}
var width = window.innerWidth;
var height = window.innerHeight;
var sceneWidth = height;
var sceneHeight = width;
var stage = new Konva.Stage({
container: 'container',
width: width/2,
height: height,
});

var layer = new Konva.Layer();

var text = new Konva.Text({
x: 10,
y: 10,
fontFamily: 'Calibri',
fontSize: 24,
text: '',
fill: 'black',
});

var box = new Konva.Rect({
    x: 20,
    y: 100,
    offset: [50, 25],
    width: 120,
    height: 80,
    fill: '#00D2FF',
    stroke: 'black',
    strokeWidth: 2,
    draggable: true,
    cornerRadius : 10
});

// write out drag and drop events
box.on('dragstart', function () {
writeMessage('dragstart');
});
box.on('dragend', function () {
writeMessage('dragend');
});

layer.add(text);
layer.add(box);

// add the layer to the stage
stage.add(layer);

function fitStageIntoParentContainer() {
    var container = document.querySelector('#konvaContainer');
    var rowContainer = document.getElementById('rowContainer');
    var codeColumn = document.getElementById("codeCol");
    console.log("fitStageIntoParentContainer");
    console.log(codeColumn.classList.contains('d-none'));
    // now we need to fit stage into parent container
    var containerWidth = container.offsetWidth;
    var rowContainerWidth = rowContainer.offsetWidth;

    stage.width(rowContainerWidth - codeColumn.offsetWidth-30);
    stage.height(container.offsetHeight-200);
    // but we also make the full scene visible
    // so we need to scale all objects on canvas

    //stage.width(sceneWidth * scale);
    //stage.width(container.offsetWidth*0.5);
    //stage.height(sceneHeight * scale);
    //stage.scale({ x: scale, y: scale });
}

fitStageIntoParentContainer();
// adapt the stage on any window resize
window.addEventListener('resize', fitStageIntoParentContainer);
