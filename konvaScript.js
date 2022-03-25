const selectToolEle = document.getElementById("selectTool");
const connectToolEle = document.getElementById("connectTool");
var width = window.innerWidth;
var height = window.innerHeight;
var sceneWidth = height;
var sceneHeight = width;
var stage = new Konva.Stage({
container: 'container',
width: width/2,
height: height,
});
var arrowLayer = new Konva.Layer();
var layer = new Konva.Layer();
var topLayer = new Konva.Layer();
var text = new Konva.Text({
x: 10,
y: 10,
fontFamily: 'Calibri',
fontSize: 24,
text: '',
fill: 'black',
});



// write out drag and drop events
/*
box.on('dragstart', function () {
writeMessage('dragstart');
});
box.on('dragend', function () {
writeMessage('dragend');
});
*/


// add the layer to the stage
stage.add(arrowLayer);
stage.add(layer);
stage.add(topLayer);
function addState(){
let oldScale = stage.scaleX();
  let centerX =  ((stage.width() / 2) - stage.x()) / oldScale;
  let centerY =  ((stage.height() / 2)- stage.y()) / oldScale;


    let circle = new Konva.Circle({
            x:centerX,
            y: centerY,
            radius: 50,
            fill: 'white',
            stroke: 'black',
            name : 'state',
            strokeWidth: 2,
            draggable: true,
            strokeScaleEnabled: false,

          });

let state_text = new Konva.Text({
 name : 'stateText',
        text:'State',
        fontSize: 18,
        fontFamily: 'Calibri',
        fill: '#000',
        width: 100,
        height: 100,
        padding: 5,
        align: 'center',
        listening : false,
        verticalAlign: 'middle',
        x: circle.x() - 50,
        y: circle.y() - 50,
    })
    circle.state_text = state_text;
    circle.on('dragmove', function () {
        circle.state_text.x(circle.x() - circle.state_text.width()/2);
        circle.state_text.y(circle.y() - circle.state_text.height()/2);
    });


    layer.add(circle);
    layer.add(state_text);
}
function fitStageIntoParentContainer() {
    var container = document.querySelector('#konvaContainer');
    var editor = document.querySelector('#editor');
    var rowContainer = document.getElementById('rowContainer');
    var codeColumn = document.getElementById("codeCol");

    // now we need to fit stage into parent container
    var containerWidth = container.offsetWidth;
    var rowContainerWidth = rowContainer.offsetWidth;

    stage.width(rowContainerWidth - codeColumn.offsetWidth-30);
    stage.height(container.offsetHeight-100);
    stage.height(container.offsetHeight-100);
    editor.style.height = (rowContainer.offsetHeight-80)+'px';

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

/**/




var tr = new Konva.Transformer({
    ignoreStroke: true,
    rotateEnabled : false,
    centeredScaling: true,
});
topLayer.add(tr);

      // by default select all shapes


      // add a new feature, lets add ability to draw selection rectangle
var selectionRectangle = new Konva.Rect({
    fill: 'rgba(0,0,255,0.5)',
    visible: false,
});
topLayer.add(selectionRectangle);

var x1, y1, x2, y2;
stage.on('mousedown touchstart', (e) => {
    // do nothing if we mousedown on any shape
    if(!selectToolEle.classList.contains('active')){
        return;
    }
    if (e.target !== stage) {
      return;
    }
    e.evt.preventDefault();
    let mousePos = mousePointToStage();
    x1 = mousePos.x;
    y1 = mousePos.y;
    x2 = mousePos.x;
    y2 = mousePos.y;

    selectionRectangle.visible(true);
    selectionRectangle.width(0);
    selectionRectangle.height(0);
});

stage.on('mousemove touchmove', (e) => {
// do nothing if we didn't start selection
    if(selectToolEle.classList.contains('active')){


        if (!selectionRectangle.visible()) {
          return;
        }
        e.evt.preventDefault();
        let mousePos = mousePointToStage();

        x2 = mousePos.x;
        y2 = mousePos.y;


        selectionRectangle.setAttrs({
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
        });
    }
    else  if(connectToolEle.classList.contains('active')){
        if (srcConNode != null){
            mpos = mousePointToStage();
            let arrowPoints = newArrow.points();
            arrowPoints[arrowPoints.length -2] = mpos.x;
            arrowPoints[arrowPoints.length -1] = mpos.y;
            newArrow.points(arrowPoints);



        }

    }
});

stage.on('mouseup touchend', (e) => {
    // do nothing if we didn't start selection
    if (!selectionRectangle.visible()) {
      return;
    }
    e.evt.preventDefault();
    // update visibility in timeout, so we can check it in click event
    setTimeout(() => {
      selectionRectangle.visible(false);
    });

    var shapes = stage.find('.state');
    var box = selectionRectangle.getClientRect();
    var selected = shapes.filter((shape) =>
      Konva.Util.haveIntersection(box, shape.getClientRect())
    );
    tr.nodes(selected);
});

// clicks should select/deselect shapes
stage.on('click tap', function (e) {
    // if we are selecting with rect, do nothing
    let mpos = mousePointToStage();
    console.log( e.target);
    if(selectToolEle.classList.contains('active')){
        if (selectionRectangle.visible()) {
          return;
        }

        // if click on empty area - remove all selections
        if (e.target === stage) {
          tr.nodes([]);
          return;
        }

        // do nothing if clicked NOT on our rectangles
        //console.log(e.target);
        if (!e.target.hasName('state')) {
          return;
        }

        // do we pressed shift or ctrl?
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = tr.nodes().indexOf(e.target) >= 0;

        if (!metaPressed && !isSelected) {
          // if no key pressed and the node is not selected
          // select just one
          tr.nodes([e.target]);

        }
        else if (metaPressed && isSelected) {
          // if we pressed keys and node was selected
          // we need to remove it from selection:
          const nodes = tr.nodes().slice(); // use slice to have new copy of array
          // remove node from array
          nodes.splice(nodes.indexOf(e.target), 1);
          tr.nodes(nodes);
        } else if (metaPressed && !isSelected) {
          // add the node into selection
          const nodes = tr.nodes().concat([e.target]);
          tr.nodes(nodes);
        }
    }
    else if(connectToolEle.classList.contains('active')){
        if (e.target.hasName('state')) {
            e.target.stroke('blue')
            e.target.strokeWidth(4);
            if (srcConNode == null){
                srcConNode = e.target;
                console.log(srcConNode);
                newArrow = new Konva.Arrow({

                    points: [srcConNode.x(), srcConNode.y(),srcConNode.x(), srcConNode.y()],

                    pointerLength: 20,
                    pointerWidth: 16,
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 2,
                    listening : false,
                    tension : 0.5,
                    strokeScaleEnabled: false,
                });
                arrowLayer.add(newArrow);
            }

        }
        else if (e.target === stage) {
        console.log('click on stage')
          if (srcConNode != null){
                 console.log("Add point to arrow");
                mpos = mousePointToStage();
                let arrowPoints = newArrow.points();
                arrowPoints[arrowPoints.length -2] = mpos.x;
                arrowPoints[arrowPoints.length -1] = mpos.y;
                newArrow.points(arrowPoints.concat([mpos.x,mpos.y]));
                console.log(arrowPoints);
                console.log(arrowPoints.concat([mpos.x,mpos.y]));
          }
        }


    }
});
/**/
var scaleBy = 1.1;
stage.on('wheel', (e) => {
    // stop default scrolling
    e.evt.preventDefault();

    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();

    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
});

function  mousePointToStage(){
    let oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();
    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    return mousePointTo;
}
var srcConNode = null;//source node for connecting
var dstConNode = null;//destination node for connecting
var newArrow = null;
function connectToolClick(){
    console.log('connectToolClick');
    //reset src and dst node
    srcConNode = null;//source node for connecting
    dstConNode = null;
    for (let idx = 0;idx<layer.children.length;idx++){
        let node =layer.children[idx]
        if (node.name() == 'state'){
            node.draggable(false);
        }
    }
}
function selectToolClick(){
    console.log('selectToolClick');

    for (let idx = 0;idx<layer.children.length;idx++){
        let node =layer.children[idx]
        if (node.name() == 'state'){
            node.draggable(true);
            node.stroke('black')
          node.strokeWidth(2);
        }
    }
}