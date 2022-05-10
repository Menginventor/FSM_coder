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
    }
    else if (eleList.length == 0){
        console.log('update global code')
        globalCode = editor.getValue();
    }


});