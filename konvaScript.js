const selectToolEle = document.getElementById("selectTool");
const connectToolEle = document.getElementById("connectTool");
const codeHeaderEle = document.getElementById("codeHeader");


const default_globalCode = `void setup(){
    fsm_init();//initialize FSM, Needed
}
void loop(){
    fsm_update();//update FSM, Needed
}
`

const default_stateCode = `// Declare local/static variable here.

if (fsm_enter_state_flag){
    //Run once when enter this state.

}
//Run repeatly for update.

`

var globalCode = default_globalCode;
var width = window.innerWidth;
var height = window.innerHeight;
var sceneWidth = height;
var sceneHeight = width;
var stateMouseOver = null;
var selectedArrow = null;
var stage = new Konva.Stage({
container: 'container',
width: width/2,
height: height,
});
var backgroundLayer = new Konva.Layer();
var arrowLayer = new Konva.Layer();
var stateLayer = new Konva.Layer();
var textLayer = new Konva.Layer();
var topLayer = new Konva.Layer();
var arrowPointsNode = [];
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




function stateCount (){
    let count = 0;
    for (let idx = 0; idx < stateLayer.children.length; idx++){
        if (stateLayer.children[idx].name() == 'state')count++;

    }
    return count;
}
function uniqueStateName(){
    let stateIdx = 1;
    let nameArr = []
    let stateArr = stateLayer.find('.state');
     for (let idx = 0; idx < stateArr.length; idx++){
        nameArr.push(stateArr[idx].state_text.text())
    }
    for(let idx = stateArr.length;idx < 99999;idx++){
         console.log(nameArr.indexOf('State'+idx));
         if (nameArr.indexOf('State'+idx) == -1){
            return 'State'+idx;
         }
    }


}


function addState(property){

  let oldScale = stage.scaleX();
  let centerX =  ((stage.width() / 2) - stage.x()) / oldScale;
  let centerY =  ((stage.height() / 2)- stage.y()) / oldScale;

    let stateX = centerX+Math.random() * 20;
    let stateY = centerY+Math.random() * 20;
    let stateRadius = 50;
    let stateFill = 'white';
    let stateText = uniqueStateName();
    let stateCode = default_stateCode;
    if (property != null){
        console.log('Create state with pre-define property');
        stateX = property.x;
        stateY = property.y;
        stateRadius = property.radius;
        stateCode = property.code;
        stateText = property.text;
        if (stateText == 'init')stateFill = 'lime';

    }

    let circle = new Konva.Circle({
            x: stateX,
            y: stateY,
            radius: stateRadius,
            fill: stateFill,
            stroke: 'black',
            name : 'state',
            strokeWidth: 2,
            draggable: true,
            strokeScaleEnabled: true,
          });

    let state_text = new Konva.Text({
    name : 'stateText',
        text:stateText,
        fontSize: 18,
        fontFamily: 'Calibri',
        fill: '#000',
        width: stateRadius*2,
        height: stateRadius*2,
        padding: 5,
        align: 'center',
        listening : false,
        verticalAlign: 'middle',
        x: circle.x() - stateRadius,
        y: circle.y() - stateRadius,
    })
    circle.state_text = state_text;
    circle.code = stateCode;
    circle.on('dragmove', function () {
        circle.state_text.x(circle.x() - circle.state_text.width()/2);
        circle.state_text.y(circle.y() - circle.state_text.height()/2);
        arrowLayer.children.forEach(function (arrow) {
            if (arrow.srcState == circle){
                destroyArrowPoints();
                let arrowPoints = arrow.points();
                arrowPoints[0] = circle.x();
                arrowPoints[1] = circle.y();
                //arrow.points(arrowPoints);
                /* update dst */

                let lastPointX = arrowPoints[arrowPoints.length -4];
                let lastPointY = arrowPoints[arrowPoints.length -3];
                let angleOfAttach = Math.atan2(lastPointY - arrow.dstState.y(),lastPointX - arrow.dstState.x());
                let attachRadius = arrow.dstState.radius() + arrow.dstState.strokeWidth();
                arrowPoints[arrowPoints.length -2] = arrow.dstState.x() + attachRadius*Math.cos(angleOfAttach);
                arrowPoints[arrowPoints.length -1] = arrow.dstState.y() + attachRadius*Math.sin(angleOfAttach);
                arrow.points(arrowPoints);
            }
            // if-if fir recurrent transistion
            if (arrow.dstState == circle){
                destroyArrowPoints();
                let arrowPoints = arrow.points();
                let lastPointX = arrowPoints[arrowPoints.length -4];
                let lastPointY = arrowPoints[arrowPoints.length -3];
                let angleOfAttach = Math.atan2(lastPointY - circle.y(),lastPointX - circle.x());
                let attachRadius = circle.radius() + circle.strokeWidth();
                arrowPoints[arrowPoints.length -2] = circle.x() + attachRadius*Math.cos(angleOfAttach);
                arrowPoints[arrowPoints.length -1] = circle.y() + attachRadius*Math.sin(angleOfAttach);
                arrow.points(arrowPoints);
            }
        });
    });
    circle.on('mouseover', function () {
        //writeMessage('Mouseover ' + this.state_text.text());
        stateMouseOver = this;
      });
    circle.on('mouseout', function () {
        //writeMessage('Mouseout');
        stateMouseOver = null;
        if (srcConNode != circle){
            circle.stroke('black')
          circle.strokeWidth(2);
        }
      });

   circle.on('dblclick dbltap', () => {
    tr.nodes([]);// Clear selection

        if (circle.state_text.text() == 'init'){
            return;
        }
        // create textarea over canvas with absolute position

        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        let textPosition = circle.state_text.getAbsolutePosition();

        // then lets find position of stage container on the page:
        let stageBox = stage.container().getBoundingClientRect();

        // so position of textarea will be the sum of positions above:
        let areaPosition = {
          x: stageBox.left + textPosition.x,
          y: stageBox.top + textPosition.y,
        };

        // create textarea and style it
        let textarea = document.createElement('div');
        document.body.appendChild(textarea);

        textarea.value = circle.state_text.text();
        textarea.innerHTML = '<div style = \"max-width : 100%\">' + circle.state_text.text() + '</div>' ;
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y+1.6 + 'px';
        textarea.style.left = areaPosition.x+3 + 'px';
        textarea.style.width = circle.width()*stage.scaleX() + 'px';
        textarea.style.height = circle.height()*stage.scaleY() + 'px';
         textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
         textarea.style.overflowWrap =  'break-word';
        textarea.style.lineHeight = circle.state_text.lineHeight();
        textarea.style.fontFamily = circle.state_text.fontFamily();
         textarea.style.fontSize = circle.state_text.fontSize()*stage.scaleX() + 'px';

         textarea.contentEditable = 'true';
         textarea.style.display = 'flex'
           textarea.style.maxWidth = '100%',
          textarea.style.alignItems = 'center';
        textarea.style.justifyContent = 'center';

        textarea.focus();
         circle.state_text.hide();
        //textarea.addEventListener('keydown', function (e) {
          // hide on enter
          //if (e.keyCode === 13) {
         //circle.state_text.text(textarea.innerText);
           // removeTextarea();
          //}
        //});
        function removeTextarea() {
          textarea.parentNode.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          circle.state_text.show();

        }
         function handleOutsideClick(e) {
          if (e.target !== textarea.children[0] && e.target !== textarea) {
            let new_name = textarea.innerText.trim();
            if (new_name != 'init') circle.state_text.text(textarea.innerText);
            removeTextarea();
          }
        }
        setTimeout(() => {
          window.addEventListener('click', handleOutsideClick);
        });
});

    circle.on('transform', function () {
        circle.radius(circle.radius()*circle.scaleX());
        circle.scaleX(1);
        circle.scaleY(1);
        state_text.width(2*circle.radius());
         state_text.height(2*circle.radius());
         state_text.x(circle.x() -circle.radius() )
         state_text.y(circle.y() -circle.radius())

        arrowLayer.children.forEach(function (arrow) {
            if (arrow.srcState == circle){
                destroyArrowPoints();
                let arrowPoints = arrow.points();
                arrowPoints[0] = circle.x();
                arrowPoints[1] = circle.y();
                arrow.points(arrowPoints);
            }
            // if-if fir recurrent transistion
            if (arrow.dstState == circle){
                destroyArrowPoints();
                let arrowPoints = arrow.points();
                let lastPointX = arrowPoints[arrowPoints.length -4];
                let lastPointY = arrowPoints[arrowPoints.length -3];
                let angleOfAttach = Math.atan2(lastPointY - circle.y(),lastPointX - circle.x());
                let attachRadius = circle.radius() + circle.strokeWidth();
                arrowPoints[arrowPoints.length -2] = circle.x() + attachRadius*Math.cos(angleOfAttach);
                arrowPoints[arrowPoints.length -1] = circle.y() + attachRadius*Math.sin(angleOfAttach);
                arrow.points(arrowPoints);
            }
        });
    });

    stateLayer.add(circle);
    stateLayer.add(state_text);
    if (property == null)tr.nodes([circle]);
    return circle;

}

function addText(property){

  let oldScale = stage.scaleX();
  let centerX =  ((stage.width() / 2) - stage.x()) / oldScale;
  let centerY =  ((stage.height() / 2)- stage.y()) / oldScale;

    let textX = centerX+Math.random() * 20;
    let textY = centerY+Math.random() * 20;
    let text_letter = 'Sample text'
    let textFill = 'black';

    if (property != null){
        console.log('Create text with pre-define property');
        textX = property.x;
        textY = property.y;

        text_letter = property.text;

    }

    let text = new Konva.Text({
        name : 'text',
        text:text_letter,
        fontSize: 18,
        fontFamily: 'Calibri',
        fill: '#000',

        padding: 0,
        align: 'left',
        verticalAlign: 'middle',
        x: textX,
        y: textY,

        draggable: true,
    })


    text.on('dragmove', function () {


    });



   text.on('dblclick dbltap', () => { // Double click for edit text on stage
    tr.nodes([]);// Clear selection


        let textPosition = text.getAbsolutePosition();

        // then lets find position of stage container on the page:
        let stageBox = stage.container().getBoundingClientRect();

        // so position of textarea will be the sum of positions above:
        let areaPosition = {
              x: stageBox.left + textPosition.x,
              y: stageBox.top + textPosition.y,
        };

        // create textarea and style it
        let textarea = document.createElement('div');
        document.body.appendChild(textarea);

        htmlText = text.text().replaceAll('\n','<br>')
        textarea.innerHTML = '<div>' + htmlText + '</div>' ;
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y+1.6 + 'px';
        textarea.style.left = areaPosition.x+3 + 'px';

        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.minWidth= "10px"; // without this line, the element's width will be zero when there are no charactor then cursor will disappear.
        textarea.style.lineHeight = text.lineHeight();
        textarea.style.fontFamily = text.fontFamily();
         textarea.style.fontSize = text.fontSize()*stage.scaleX() + 'px';

        textarea.contentEditable = 'true';
        textarea.style.display = 'block'
        textarea.focus();
        document.execCommand('selectAll',false,null);
        console.log(textarea)
        textarea.addEventListener('keypress', function (e) {
        console.log(e);
                if (e.keyCode === 13 || e.which === 13) {
                    //e.preventDefault();
                    if (! e.shiftKey){
                        e.preventDefault();
                        //return false;
                    }
                    else console.log('detect shift key')
                }

            })
         text.hide();

        function removeTextarea() {
          textarea.parentNode.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          text.show();

        }
         function handleOutsideClick(e) {
          if (e.target !== textarea.children[0] && e.target !== textarea) {
            let new_name = textarea.innerText.trim();
          text.text(textarea.innerText);
            removeTextarea();
          }
        }
        setTimeout(() => {
          window.addEventListener('click', handleOutsideClick);
        });
});

    text.on('transform', function () {



    });

    textLayer.add(text);

    if (property == null)tr.nodes([text]);
    return text;

}


function zoomFit(){
    console.log('Zoom to fit');
    tr.nodes(stateLayer.children);
    tr.nodes(tr.nodes().concat(arrowLayer.children))
    tr.nodes(tr.nodes().concat(textLayer.children))

    let oldScale = stage.scaleX();

    let newX =  (tr.x() - stage.x()) / oldScale;
    let newY = (tr.y() - stage.y()) / oldScale;

    let newW = tr.width()/stage.scaleX();
    let newH = tr.height()/stage.scaleX();

     console.log('newW',newW);
    console.log('newH',newH);

    let scaleX = stage.width()/newW;
    let scaleY = stage.height()/newH;
    let scaleMin =  Math.min(scaleX, scaleY)*0.9;
    console.log('scaleMin',scaleMin)
    stage.scale({ x: scaleMin, y: scaleMin });

    let scaleW = newW*scaleMin;
    let scaleH = newH*scaleMin;
    let newPos = {
      x: -newX*scaleMin + (stage.width() - scaleW)/2,
      y: -newY*scaleMin + (stage.height() - scaleH)/2,
    };
    stage.position(newPos);
    tr.nodes([]);
    backgroundShapeUpdate();
}
function fitStageIntoParentContainer() {
    let rowContainerWidth = $('#rowContainer').outerWidth()-30
    stage.width(rowContainerWidth - $('#codeCol').outerWidth());
    stage.height($('#rowContainer').height()-30);
    let editor = document.querySelector('#editor');
    $('#editor').height (rowContainer.offsetHeight-80);

}

fitStageIntoParentContainer();
// adapt the stage on any window resize
window.addEventListener('resize', fitStageIntoParentContainer);

/**/




var tr = new Konva.Transformer({
    ignoreStroke: true,
    rotateEnabled : false,
    centeredScaling: true,
    keepRatio: true,
    enabledAnchors: [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ],
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
    else  if(connectToolEle.classList.contains('active')){//For connect tool
        if (srcConNode != null){
            mpos = mousePointToStage();
            let arrowPoints = newArrow.points();

            if (stateMouseOver != null){
                stateMouseOver.stroke('blue')
                stateMouseOver.strokeWidth(4);
                let lastPointX = arrowPoints[arrowPoints.length -4];
                let lastPointY = arrowPoints[arrowPoints.length -3];
                let angleOfAttach = Math.atan2(lastPointY - stateMouseOver.y(),lastPointX - stateMouseOver.x());
                let attachRadius = stateMouseOver.radius() + stateMouseOver.strokeWidth();
                arrowPoints[arrowPoints.length -2] = stateMouseOver.x() + attachRadius*Math.cos(angleOfAttach);
                arrowPoints[arrowPoints.length -1] = stateMouseOver.y() + attachRadius*Math.sin(angleOfAttach);

            }
            else{
                arrowPoints[arrowPoints.length -2] = mpos.x;
                arrowPoints[arrowPoints.length -1] = mpos.y;
            }

            newArrow.points(arrowPoints);



        }

    }
});

stage.on('mouseup touchend', (e) => {
    console.log("mouseup touchend");
    // do nothing if we didn't start selection
    if (!selectionRectangle.visible()) {
      return;
    }
    e.evt.preventDefault();
    // update visibility in timeout, so we can check it in click event
    setTimeout(() => {
      selectionRectangle.visible(false);
    });

    let shapes = stage.find('.state,.text');
    let box = selectionRectangle.getClientRect();
    let selected = shapes.filter((shape) =>
      Konva.Util.haveIntersection(box, shape.getClientRect())
    );
    tr.nodes(selected);
     if (tr.node != null){
            let eleList = tr.nodes()
            for (let idx = 0; idx < arrowLayer.children.length; idx++){
                let idx_arrow = arrowLayer.children[idx];
                if ( tr.nodes().includes(idx_arrow.srcState) &&  tr.nodes().includes(idx_arrow.dstState)){
                    //console.log("Found affected arrow!");
                    showArrowPoints(idx_arrow);
                    const oldNodes = tr.nodes();
                    const newNodes = oldNodes.concat(idx_arrow);
                    // it is important to set new array instance (and concat method above will create it)
                    //tr.nodes(newNodes);


                }

            }
    }

    container.focus();
});

stage.on('contextmenu', function (e) {
        console.log('contextmenu');
        // prevent default behavior
        e.evt.preventDefault();
        if (e.target === stage) {
          // if we are on empty place of the stage we will do nothing
          return;
        }


});

// clicks should select/deselect shapes
stage.on('click tap', function (e) {

    // if we are selecting with rect, do nothing
    let mpos = mousePointToStage();

    if(selectToolEle.classList.contains('active')){
        console.log('click event');
        console.log(selectionRectangle.visible());
        if (selectionRectangle.visible()) {
            console.log('return');
          //return;
        }

        // if click on empty area - remove all selections


        // do nothing if clicked NOT on our rectangles
        //console.log(e.target);
        if (e.target.hasName('state')) {
            console.log('state clicked');
            // do we pressed shift or ctrl?
            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            const isSelected = tr.nodes().indexOf(e.target) >= 0;

            if (!metaPressed && !isSelected) {
              // if no key pressed and the node is not selected
              // select just one
              tr.nodes([e.target]);

              codeHeaderEle.innerText = 'State: '+e.target.state_text.text();
              editor.session.setValue(e.target.code,-1);

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
        if (e.target.hasName('text')) {
            console.log('text clicked');
            // do we pressed shift or ctrl?
            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            const isSelected = tr.nodes().indexOf(e.target) >= 0;

            if (!metaPressed && !isSelected) {
              // if no key pressed and the node is not selected
              // select just one
              tr.nodes([e.target]);

              codeHeaderEle.innerText = '';
              editor.session.setValue('',-1);

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

        if (e.target.hasName('arrow')) {
        tr.nodes([]);

            e.target.stroke('blue');
            e.target.fill('blue');
            if (selectedArrow != null){
                //reset previous selectedArrow
                selectedArrow.stroke('black');
                selectedArrow.fill('black');
                selectedArrow.text.fill('black');
            }

            selectedArrow = e.target;
            codeHeaderEle.innerText = 'Transition';
            console.log('arrow clicked');
            console.log(e.target.code)
            editor.session.setValue(e.target.code,-1);

            selectedArrow.fill('blue');
            selectedArrow.stroke('blue');
            showArrowPoints(selectedArrow);
        }
        else  if (e.target.hasName('arrowPoint')) {
            //Do nothing
        }
        else{
            //console.log('not arrow');
          if (selectedArrow != null){
                    selectedArrow.stroke('black');
                    selectedArrow.fill('black');
                    selectedArrow.text.fill('black');
            }
            selectedArrow = null;
            destroyArrowPoints();
        }
           if (e.target === stage) {
          tr.nodes([]);
           console.log('stage clicked');
           codeHeaderEle.innerText = 'Global scope';
           editor.session.setValue(globalCode,-1);
           container.focus();
//          return;
        }

    }
    else if(connectToolEle.classList.contains('active')){
        if (e.evt.button == 0){//left mouse button
            if (e.target.hasName('state')) {
                e.target.stroke('blue')
                e.target.strokeWidth(4);
                if (srcConNode == null){ // select source node
                    srcConNode = e.target;
                    console.log(srcConNode);
                    newArrow = createNewArrow();
                }
                else{ // select destination node

                ////
                    newArrow.srcState = srcConNode;
                    newArrow.dstState = e.target;
                    let textX,textY;
                    arrowPoints = newArrow.points();
                    if (arrowPoints.length%4 == 0){
                        console.log('Even arrow point');
                        textX = (arrowPoints[arrowPoints.length/2-2] + arrowPoints[arrowPoints.length/2])/2;
                        textY = (arrowPoints[arrowPoints.length/2-1] + arrowPoints[arrowPoints.length/2+1])/2;
                         console.log((arrowPoints.length))
                         console.log(arrowPoints.length/2-2)
                        console.log(arrowPoints.length/2-1)

                    }
                    else {
                        console.log('Odd arrow point');
                        textX = arrowPoints[arrowPoints.length/2 - 1];
                        textY = arrowPoints[arrowPoints.length/2];
                        console.log((arrowPoints.length))
                         console.log(parseInt(arrowPoints.length/4))
                        console.log(parseInt(arrowPoints.length/4+1))
                    }
                    console.log(textX)
                    console.log(textY)
                    newArrow.text.x(textX);
                    newArrow.text.y(textY);
                    srcConNode.stroke('black')
                    srcConNode.strokeWidth(2);
                    srcConNode = null;
                    stateMouseOver.stroke('black')
                    stateMouseOver.strokeWidth(2);
                    newArrow.listening (true);
                }

            }
            else if (e.target === stage) {
                console.log('click on stage')
                console.log(e.evt.button);
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
        if (e.evt.button == 2){//right mouse button
            console.log('Right mouse click, destroy arrow');

            if (srcConNode != null){
                srcConNode.stroke('black')
                srcConNode.strokeWidth(2);
                newArrow.destroy();
            }
        }
    }
});

function createNewArrow(property){
    let arrowPoints = [];
    let eventListening = false;
    let textX;
    let textY;
    if (property != null){
        console.log('Create arrow with pre-difined property');
        console.log(property);
        arrowPoints = property.points;
        eventListening = true;
        textX = property.textX;
        textY = property.textY;


    }
    else{
        arrowPoints = [srcConNode.x(), srcConNode.y(),srcConNode.x(), srcConNode.y()];
        textX = arrowPoints[0];
        textY = arrowPoints[1];
    }

    let arrow = new Konva.Arrow({

        points: arrowPoints,

        pointerLength: 20,
        pointerWidth: 16,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 2,
        listening : eventListening,
        tension : 0.5,
        strokeScaleEnabled: true,
        name : 'arrow',
    });
    arrow.code = '';
    if (property != null){
        arrow.srcState = stateLayer.children[property.srcStateIdx];
        arrow.dstState = stateLayer.children[property.dstStateIdx];
        arrow.code = property.code;
    }
    arrow.on('mouseover', function () {
        this.fill('blue');
        this.text.fill('blue');
        this.stroke('blue');
        this.strokeWidth(8);
    });
    arrow.on('mouseout', function () {
        if (this != selectedArrow){
            this.fill('black');
            this.text.fill('black');

            this.stroke('black');
        }


         this.strokeWidth(2);

    });
    arrow.on('dragmove', function () {

        let arrowPoints = arrow.points();
         for (let idx = 0; idx < arrowPoints.length; idx +=2){



            if (idx != 0 && idx != arrowPoints.length-2) {
                let px = arrowPoints[idx]+arrow.x();
                let py = arrowPoints[idx+1]+arrow.y();
                arrowPoints[idx] = px;
                arrowPoints[idx+1] = py;
            }


         }
         //arrow.x(0);
         //arrow.y(0);

    });
    arrow.on('dblclick dbltap', () => {
        if(selectToolEle.classList.contains('active')){
            console.log('arrow double clicked');
            let arrowPoints = arrow.points();
            let minDist = null;
            let minIdx = -1;
            let mpos = mousePointToStage();
            for (let idx = 0; idx < arrowPoints.length-2; idx +=2){
                let pa = [arrowPoints[idx],arrowPoints[idx+1]];
                let pb = [arrowPoints[idx+2],arrowPoints[idx+3]];

                let pe = [mpos.x,mpos.y];
                ret = p2segDist(pa,  pb,  pe);
                if (ret.inside){
                    if (minDist == null){
                        minDist = ret.dist;
                        minIdx = idx;
                    }
                    else if (ret.dist < minDist){
                        minDist = ret.dist;
                        minIdx = idx;
                    }
                }


            }
            console.log(minIdx);
            if (minIdx >= 0){
                arrowPoints.splice(minIdx+2, 0, mpos.x);
                arrowPoints.splice(minIdx+3, 0, mpos.y);
                arrow.points(arrowPoints);
                showArrowPoints(arrow);
            }
        }

    });
    arrowLayer.add(arrow);
    let arrow_text = new Konva.Text({
        name : 'arrowText',
        text: arrow.code,
        fontSize: 18,
        fontFamily: 'Calibri',
        fill: '#000',

        padding: 5,
        align: 'center',
        listening : true,
        draggable: true,
        verticalAlign: 'middle',
        x: textX,
        y: textY,
    })
    arrow.text = arrow_text;
    arrowLayer.add(arrow_text);
    return arrow;
}
function destroyArrowPoints(){
    for (let idx = 0;idx < arrowPointsNode.length;idx++){
       arrowPointsNode[idx].destroy();
    }
     arrowPointsNode = [];
}
function showArrowPoints(arrow){
    destroyArrowPoints();
    let arrowPoints = arrow.points();
    for (let idx = 0; idx < arrowPoints.length; idx +=2){
        let px = arrowPoints[idx];
        let py = arrowPoints[idx+1];
        let point_type = 'middle';

        if (idx == 0) point_type = 'start';
        else if (idx == arrowPoints.length-2) {
            point_type = 'end';
            if (arrow.dstState != null){
                px = arrow.dstState.x();
                py = arrow.dstState.y();
            }
        }
        else if (idx == arrowPoints.length-4) point_type = 'before-end';
        let circle = new Konva.Circle({
            x: px,
            y:py,
            radius: 10,
            fill: 'green',
            stroke: 'black',
            name : 'arrowPoint',
            strokeWidth: 2,
            draggable: true,
            strokeScaleEnabled: false,
            point_idx : idx,
            point_type : point_type,

        });

        circle.on('dragmove', function () {


            let arrowPoints = arrow.points();
            arrowPoints[this.attrs.point_idx] = this.x();
            arrowPoints[this.attrs.point_idx+1] = this.y();

            if (point_type == 'start' || point_type == 'end'){

                 stateMouseOver = null;
                 stateLayer.children.slice().reverse().forEach(function (shape) {
                        if (shape.hasName('state')){
                         let deltaX = circle.x() - shape.x();
                            let deltaY = circle.y() - shape.y();
                            let dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
                            console.log(deltaX);
                            if (dist < shape.radius()){

                                if (stateMouseOver == null){
                                    stateMouseOver = shape;
                                    stateMouseOver.stroke('blue')
                                    stateMouseOver.strokeWidth(4);
                                    circle.hide();
                                    if (point_type == 'start'){
                                         arrowPoints[circle.attrs.point_idx] = shape.x();
                                        arrowPoints[circle.attrs.point_idx+1] = shape.y();
                                    }
                                    else if (point_type == 'end'){
                                        let lastPointX = arrowPoints[circle.attrs.point_idx-2];
                                        let lastPointY = arrowPoints[circle.attrs.point_idx-1];
                                        let angleOfAttach = Math.atan2(lastPointY - shape.y(),lastPointX - shape.x());
                                        let attachRadius = shape.radius() + shape.strokeWidth();
                                        arrowPoints[circle.attrs.point_idx] = stateMouseOver.x() + attachRadius*Math.cos(angleOfAttach);
                                        arrowPoints[circle.attrs.point_idx +1] = stateMouseOver.y() + attachRadius*Math.sin(angleOfAttach);

                                    }
                                }
                                else{
                                    shape.stroke('black')
                                    shape.strokeWidth(2);
                                }
                            }

                            else{
                                shape.stroke('black')
                                shape.strokeWidth(2);
                            }

                        }
                 });
                 if (stateMouseOver == null){//not found any collision
                    circle.show();
                 }
            }
            else if (point_type == 'before-end'){
                let lastPointX = arrowPoints[circle.attrs.point_idx];
                let lastPointY = arrowPoints[circle.attrs.point_idx+1];
                let angleOfAttach = Math.atan2(lastPointY - arrow.dstState.y(),lastPointX -  arrow.dstState.x());
                let attachRadius =  arrow.dstState.radius() +  arrow.dstState.strokeWidth();
                arrowPoints[circle.attrs.point_idx +2] = arrow.dstState.x() + attachRadius*Math.cos(angleOfAttach);
                arrowPoints[circle.attrs.point_idx +3] = arrow.dstState.y() + attachRadius*Math.sin(angleOfAttach);
                //

            }
            arrow.points(arrowPoints);
        });
        circle.on('dragend', function () {

              if (stateMouseOver != null){
                if (point_type == 'end') arrow.dstState = stateMouseOver;
                else if (point_type == 'start') arrow.srcState = stateMouseOver;
              }
              showArrowPoints(arrow);

        });
       circle.on('dblclick dbltap', () => {
        console.log('arrow point double clicked');
              let arrowPoints = arrow.points();
            arrowPoints.splice(circle.attrs.point_idx,2);
            arrow.points(arrowPoints);
            showArrowPoints(arrow);
       });
        arrowPointsNode.push(circle);
        topLayer.add(circle);

    }

}
/**/
var scaleBy = 1.1;
stage.on('wheel', (e) => {
    // stop default scrolling
    e.evt.preventDefault();

    let oldScale = stage.scaleX();
    let pointer = stage.getPointerPosition();

    let mousePointTo = {
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

    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    let newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
backgroundShapeUpdate();

});

function  mousePointToStage(){
    let oldScale = stage.scaleX();
    let pointer = stage.getPointerPosition();
    let mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    return mousePointTo;
}
var srcConNode = null;//source node for connecting
var dstConNode = null;//destination node for connecting
var newArrow = null;
function connectToolClick(){
    stage.container().style.cursor = 'default';
    stage.draggable(false);
    console.log('connectToolClick');
    //reset src and dst node
    if (srcConNode != null){
        srcConNode.stroke('black')
        srcConNode.strokeWidth(2);
        newArrow.destroy();
    }
    srcConNode = null;//source node for connecting
    dstConNode = null;
    for (let idx = 0;idx<stateLayer.children.length;idx++){
        let node = stateLayer.children[idx]
        if (node.name() == 'state'){
            node.draggable(false);
        }
    }
}
function selectToolClick(){
    stage.container().style.cursor = 'default';
    stage.draggable(false);
    console.log('selectToolClick');
    if (srcConNode != null){
        srcConNode.stroke('black')
        srcConNode.strokeWidth(2);
        newArrow.destroy();
    }

    for (let idx = 0;idx<stateLayer.children.length;idx++){
        let node =stateLayer.children[idx]
        if (node.name() == 'state'){
            node.draggable(true);
            node.stroke('black')
            node.strokeWidth(2);
        }
    }
}
function panToolClick(){
    stage.draggable(true);
    stage.container().style.cursor = 'move';
}
function p2segDist(A,  B,  E){

    //from https://www.geeksforgeeks.org/minimum-distance-from-a-point-to-the-line-segment-using-vectors/
    // vector AB
    let AB=[];
    AB.push (B[0] - A[0]);
    AB.push(B[1] - A[1]);

    // vector BP
    let BE=[];
    BE.push(E[0] - B[0]);
    BE.push(E[1] - B[1]);

    // vector AP
   let AE=[];
    AE.push(E[0] - A[0]),
    AE.push(E[1] - A[1]);

    // Variables to store dot product
    let AB_BE, AB_AE;

    // Calculating the dot product
    AB_BE=(AB[0] * BE[0] + AB[1] * BE[1]);
    AB_AE=(AB[0] * AE[0] + AB[1] * AE[1]);


    // Case 1
    ret = [];
    if (AB_BE > 0) {

        // Finding the magnitude
       ret.inside = false;
    }

    // Case 2
    else if (AB_AE < 0) {
        ret.inside = false;
    }
    else{
       var x1 = AB[0];
        var y1 = AB[1];
       var x2 = AE[0];
        var y2 = AE[1];
        var mod = Math.sqrt(x1 * x1 + y1 * y1);
        let reqAns = Math.abs(x1 * y2 - y1 * x2) / mod;
        ret.inside = true;
        ret.dist = reqAns;
    }
    return ret;
}

var background = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
   fill : 'white',

    // remove background from hit graph for better perf
    // because we don't need any events on the background
    listening: false,
});
backgroundLayer.add(background);
stage.on('dragmove', () => {
backgroundShapeUpdate();
  });
function backgroundShapeUpdate(){
    background.absolutePosition({ x: 0, y: 0 });
     background.width(stage.width()/stage.scaleX());
     background.height(stage.height()/stage.scaleX());

}
stage.add(backgroundLayer);
stage.add(arrowLayer);
stage.add(stateLayer);
stage.add(textLayer);
stage.add(topLayer);
editor.session.setValue(globalCode,-1);
const container = stage.container();

// make it focusable

container.tabIndex = 1;
// focus it
// also stage will be in focus on its click
container.focus();
container.addEventListener('keydown', function (event) {
    const keyName = event.key;
    console.log('Key pressed '+ keyName);
    if (keyName == 'Backspace' || keyName == 'Delete'){
        deleteShape();
    }

});

function deleteShape(){
        if (tr.node != null){
            let eleList = tr.nodes()
            for (let idx = 0;idx < eleList.length; idx++){// loop through selected element
                //check if element is state
                if (eleList[idx].parent == stateLayer){
                    console.log("element is state");
                    if (eleList[idx].state_text.text() != 'init'){
                        //
                        arrowLayer.children.forEach(function (arrow) {
                        if (arrow.srcState == eleList[idx]){
                            arrow.srcState = null;
                        }
                        // if-if fir recurrent transistion
                        if (arrow.dstState == eleList[idx]){
                            arrow.dstState = null;
                        }
                        });
                        eleList[idx].state_text.destroy();
                        eleList[idx].destroy();
                    }
                }
                else if (eleList[idx].parent == arrowLayer){
                        eleList[idx].text.destroy();
                        eleList[idx].destroy();
                }
                else{
                    eleList[idx].destroy();
                }


            }

            tr.nodes([]);
        }
        if (selectedArrow != null){

            destroyArrowPoints();
            selectedArrow.text.destroy();
            selectedArrow.destroy();
            
            selectedArrow = null;
        }
}
var initState = addState();
initState.state_text.text('init');
initState.fill('lime');
tr.nodes([])
tr.on('dragmove', function () {
    if (tr.node != null){
            let eleList = tr.nodes()
            for (let idx = 0; idx < arrowLayer.children.length; idx++){
                let idx_arrow = arrowLayer.children[idx];
                if ( tr.nodes().includes(idx_arrow.srcState) &&  tr.nodes().includes(idx_arrow.dstState)){
                    //console.log("Found affected arrow!");
                }

            }
    }

});
