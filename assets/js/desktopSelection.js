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

for(var i in displays) {
    width = displays[i].bounds.width;
    height = displays[i].bounds.height;
}
let muted = false;

let selectionButtons = document.getElementById('selectionButtons');
var element = document.getElementById('screenArea')
var x = 0;
var y = 0;
var screenWidth = 100;
var screenHeight = 50;
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
        selectionButtons.style.display = 'block';

        if((y-buttonsHeight) >= 0){
            selectionButtons.style.left = x + 'px';
            selectionButtons.style.top =(y-buttonsHeight) + 'px';
        } else if((height-screenHeight-y-buttonsHeight) >= 0){
            selectionButtons.style.left = x + 'px';
            selectionButtons.style.top =(screenHeight+y) + 'px';
        }else if((x-buttonsWidth) >= 0){
            selectionButtons.style.left = (x-buttonsWidth) + 'px';
            selectionButtons.style.top =y + 'px';
        }else if((width-screenWidth-x-buttonsWidth) >= 0){
            selectionButtons.style.left = (screenWidth+x) + 'px';
            selectionButtons.style.top =y + 'px';
        }else{
            selectionButtons.style.left = x + 'px';
            selectionButtons.style.top =y + 'px';
        }
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
        screenWidth = event.rect.width;
        screenHeight = event.rect.height;
        selectionButtons.style.display = 'block';

        if((y-buttonsHeight) >= 0){
            selectionButtons.style.left = x + 'px';
            selectionButtons.style.top =(y-buttonsHeight) + 'px';
        } else if((height-screenHeight-y-buttonsHeight) >= 0){
            selectionButtons.style.left = x + 'px';
            selectionButtons.style.top =(screenHeight+y) + 'px';
        }else if((x-buttonsWidth) >= 0){
            selectionButtons.style.left = (x-buttonsWidth) + 'px';
            selectionButtons.style.top =y + 'px';
        }else if((width-screenWidth-x-buttonsWidth) >= 0){
            selectionButtons.style.left = (screenWidth+x) + 'px';
            selectionButtons.style.top =y + 'px';
        }else{
            selectionButtons.style.left = x + 'px';
            selectionButtons.style.top =y + 'px';
        }
    })

function cancelSelection() {
    remote.getCurrentWindow().close();
}
function muteRecordedVideo() {
    document.querySelector('#mute>.fas').classList.toggle("fa-microphone");
    document.querySelector('#mute>.fas').classList.toggle("fa-microphone-slash");
    if(muted){
        muted = false;
    }else{
        muted = true;
    }
}