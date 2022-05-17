editor.session.on('change', function(delta) {
    // delta.start, delta.end, delta.lines, delta.action
    //console.log('Ace editor changed');
    let eleList = tr.nodes();
    if (eleList.length == 1){
        console.log('update state code')
        eleList[0].code = editor.getValue();
    }
    else  if (selectedArrow != null){
        console.log('update arrow code');
        selectedArrow.code = editor.getValue();
        selectedArrow.text.text(editor.getValue());
    }
    else if (eleList.length == 0 && codeHeaderEle.innerText == 'Global scope'){
        console.log('update global code')
        globalCode = editor.getValue();
    }
});

const generateInoBtn = document.getElementById('generateIno');
generateInoBtn.addEventListener('click', async () => {
   generateIno();
});
async function generateIno(){
    console.log('generateIno');
    let outputCode = '';
    outputCode += globalCode + '\n';
    outputCode += fsm_init_code;

    //Generate state code
    console.log('Generate state\'s code');
    for (let idx = 0; idx < stateLayer.children.length; idx++){
        let child = stateLayer.children[idx]
        if (child.name() == 'state'){
            const stateName = child.state_text.text().trim();
            console.log(stateName);
            const state_function_name = 'fsm_'+stateName + '_state';
            let stateCode = 'void ' + state_function_name +' (){\n    ';

            stateCode += child.code.replaceAll('\n','\n    ');
            // Transition
            arrowLayer.children.forEach(function (arrow) {
                if (arrow.srcState == child){
                    let condition = 'true';
                    if ( arrow.code.trim().length > 0) condition = arrow.code.trim();
                    let transitionCode = '\n    if( ' + condition + ' ){\n'

                    const nxtStateName = 'fsm_'+arrow.dstState.state_text.text().trim()+ '_state';
                    transitionCode += '        fsm_state = &' + nxtStateName + ';\n';
                    transitionCode += '        fsm_enter_state_flag = true;\n';
                    transitionCode += '        return;\n';

                    transitionCode += '    }\n'
                    console.log(transitionCode);
                    stateCode += transitionCode;
                }
            });
            stateCode += '    fsm_enter_state_flag = false; // Reset flag\n'; //reset flag
            stateCode += '\n}\n';//End of function
            outputCode += stateCode;
        }
    }


    // Display output code

    tr.nodes([]);
    selectedArrow = null;
    destrosArrowPoints();
    codeHeaderEle.innerText = 'Output Code';
    editor.session.setValue(outputCode,-1);
}

const fsm_init_code = `
//This section gennerated by FSM Coder
void (*fsm_state)(void); // use function pointer as state variable;
bool fsm_enter_state_flag = true;
void fsm_init(){
    fsm_state = &fsm_init_state;
}
void fsm_update(){
    (*fsm_state)();//call FSM state
}
`;
