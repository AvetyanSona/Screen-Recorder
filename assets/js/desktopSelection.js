// const fs = require('fs');
// const https = require('https');
// const shell = require('electron').shell;
// const remote = require('electron').remote;
// const BrowserWindow = remote.BrowserWindow;
// const {net} = require('electron').remote;
// const querystring = require('querystring');
// const serverUrl = 'http://localhost:9000/';
const remote = require('electron').remote;
const interact = require('interactjs');
let screen = remote.screen;

let displays = screen.getAllDisplays();
let width;
let height;
const buttonsHeight = 54;
const buttonsWidth = 155.5;

for(var i in displays)
{
    width = displays[i].bounds.width;
    height = displays[i].bounds.height;
}
// var clickCount = 0;
// var onMouseUp = false;
let div = document.getElementById('screenArea'), x1 = 0, y1 = 0, x2 = 0, y2 = 0;
let selectionButtons = document.getElementById('selectionButtons');

// function reCalc() {
//     var x3 = Math.min(x1,x2);
//     var x4 = Math.max(x1,x2);
//     var y3 = Math.min(y1,y2);
//     var y4 = Math.max(y1,y2);
//     div.style.left = x3 + 'px';
//     div.style.top = y3 + 'px';
//     div.style.width = x4 - x3 + 'px';
//     div.style.height = y4 - y3 + 'px';
// }
// onmousedown = function(e) {
//     div.hidden = 0;
//     x1 = e.clientX;
//     y1 = e.clientY;
//     reCalc();
//     clickCount++;
// };
// onmousemove = function(e) {
//     x2 = e.clientX;
//     y2 = e.clientY;
//     if(!onMouseUp){
//         reCalc();
//     }
// };
// onmouseup = function(e) {
//     let selectedBlockTop = Math.min(y1,y2);
//     let selectedBlockRight = width- Math.max(x1,x2);
//     let selectedBlockBottom = height - Math.max(y1,y2);
//     let selectedBlockLeft = Math.min(x1,x2);
//     if (clickCount == 1) {
//         div.hidden = 0;
//         onMouseUp = true;
//         selectionButtons.hidden = 0;
//         if ((selectedBlockTop - buttonsHeight) >= 0) {
//             console.log('top',(selectedBlockTop - buttonsHeight))
//             selectionButtons.style.top = (selectedBlockTop - buttonsHeight) + 'px';
//             selectionButtons.style.left = selectedBlockLeft + 'px';
//         } else if ((selectedBlockBottom - buttonsHeight) >= 0){
//             console.log('bottom',(selectedBlockBottom - buttonsHeight))
//             selectionButtons.style.bottom = selectedBlockBottom  + 'px';
//             selectionButtons.style.left = selectedBlockLeft + 'px';
//         } else if((selectedBlockLeft - buttonsWidth) >= 0){
//             console.log('left',(selectedBlockLeft - buttonsWidth))
//             selectionButtons.style.left = selectedBlockLeft + 'px';
//             selectionButtons.style.top = selectedBlockTop + 'px';
//         }else if((selectedBlockRight - buttonsWidth) >= 0){
//             console.log('right',(selectedBlockRight - buttonsWidth))
//             selectionButtons.style.right = selectedBlockRight + 'px';
//             selectionButtons.style.bottom = selectedBlockBottom + 'px';
//         }else{
//             console.log('else',selectedBlockTop,selectedBlockLeft)
//             selectionButtons.style.top = selectedBlockTop + 'px';
//             selectionButtons.style.left = selectedBlockLeft + 'px';
//         }
//     }
//     else {
//         div.hidden = 1;
//         clickCount = 0;
//         onMouseUp = false;
//         selectionButtons.hidden = 1;
//     }
// };
var element = document.getElementById('screenArea')
var x = 0; var y = 0

interact(element)
    .resizable({
        // resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },

        modifiers: [
            // keep the edges inside the parent
            interact.modifiers.restrictEdges({
                outer: 'parent'
            }),

            // minimum size
            interact.modifiers.restrictSize({
                min: { width: 100, height: 50 }
            })
        ],
        inertia: true
    })
    .on('dragmove', function (event) {
        x += event.dx
        y += event.dy
        event.target.style.webkitTransform =
            event.target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)'
        event.target.setAttribute('data-x',x)
        event.target.setAttribute('data-y',y)
    })
    .draggable({
        modifiers: [
            interact.modifiers.snap({
                targets: [
                    interact.createSnapGrid({ x: 30, y: 30 })
                ],
                range: Infinity,
                relativePoints: [ { x: 0, y: 0 } ]
            }),
            interact.modifiers.restrict({
                restriction: element.parentNode,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                endOnly: true
            })
        ],
        inertia: true
    })
    .on('resizemove', function (event) {
        var target = event.target
        var x = (parseFloat(target.getAttribute('data-x')) || 0)
        var y = (parseFloat(target.getAttribute('data-y')) || 0)
        console.log(x)
        console.log(y)
        // update the element's style
        target.style.width = event.rect.width + 'px'
        target.style.height = event.rect.height + 'px'

        // translate when resizing from top or left edges
        x += event.deltaRect.left
        y += event.deltaRect.top

        target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)'

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
        target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
    })






