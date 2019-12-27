// Modified by hokein
//
// Copyright 2014 Intel Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// Author: Dongseong Hwang (dongseong.hwang@intel.com)

const {shell} = require('electron');
const remote = require('electron').remote;
const desktopCapturer = require('electron').desktopCapturer;
const currWindow   = remote.getCurrentWindow();
const app = remote.app;
const BrowserWindow = remote.BrowserWindow;
const documents_path = app.getPath('documents');
const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;
// if (!fs.existsSync(documents_path+'/rumpleRecorder')) {
//     fs.mkdirSync(documents_path+'/rumpleRecorder');
// }
// const files_path = documents_path+'/rumpleRecorder';
const files_path = __dirname+'/upload';

let desktopSharing = false;
let localStream;
let recorder;
let blobs = [];
let audioInputSelect;
let audioInputId;
let secs_block = document.querySelector("#secs");
let mins_block = document.querySelector("#mins");
let hours_block = document.querySelector("#hours");
let timer_;
let paused = false;
let in_process = false;
let muted = false;
let secs = 0;
let mins = 0;
let hours = 0;
let restoreButton = document.getElementById('min-btn');
let devices = [];
let selectedDevice;
// Set MyGlobalVariable.

// Read MyGlobalVariable.

//Window Onload
$(document).ready(function() {
    audioInputSelect = document.querySelector('#audioInputSelect');
    videoSelect = document.querySelector('#videoSelectSelect');
    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices)
        .catch(errorCallback);

    function gotDevices(deviceInfos) {
        for (let i = 0; i !== deviceInfos.length; ++i) {
            let deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === 'audioinput') {
            }
            let option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput' && deviceInfo.deviceId != 'default' && deviceInfo.deviceId != 'communications' ) {
                option.text = deviceInfo.label ||
                    'Microphone ' + (audioInputSelect.length + 1);
                audioInputSelect.appendChild(option);
            } else if (deviceInfo.kind === 'audiooutput' && deviceInfo.deviceId != 'default' && deviceInfo.deviceId != 'communications') {
                option.text = deviceInfo.label || 'Speaker ' +
                    (audioOutputSelect.length + 1);
                audioOutputSelect.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput' && deviceInfo.deviceId != 'default' && deviceInfo.deviceId != 'communications') {
                option.text = deviceInfo.label || 'Camera ' +
                    (videoSelect.length + 1);
                videoSelect.appendChild(option);
            }
        }
    }
    function  errorCallback(e) {}

    document.querySelector('#audioInputSelect').addEventListener('change', function(e) {
        selectedDevice = document.getElementById("audioInputSelect").value;
    })
    restoreButton.addEventListener("click", event => {
        wnd = remote.getCurrentWindow();
        wnd.minimize();
    });
});

document.querySelector('#start').addEventListener('click', function(e) {
    if(in_process){
        in_process = false;
    }else{
        in_process = true;
    }
    toggle();
});
//Timer
function timer(action) {
    if (action) {
        if (!paused) {
             secs = 0;
             mins = 0;
             hours = 0;
        }
        timer_ = setInterval(function () {
            if (secs > 59) {
                secs = 0;
                mins++;
            }
            secs++;
            if (mins > 59) {
                secs = 0;
                hours++;
            }
            if(mins == 11){
                desktopSharing = true;
                in_process = false;
                toggle();
            }
            secs_block.innerHTML = secs < 10 ? "0"+secs : secs;
            if(mins > 0) {
                mins_block.innerHTML = mins < 10 ? "0"+mins : mins;
            }
            if(hours > 0) {
                hours_block.innerHTML = hours < 10 ? "0"+hours : hours;
            }

        },1000)
    } else {
      clearInterval(timer_);
        if (!paused) {
            secs_block.innerHTML = '&nbsp;';
            mins_block.innerHTML = '&nbsp;';
            hours_block.innerHTML = '&nbsp;';
        }
    }
}

//Click Events
function toggle() {
    document.querySelector('#pause_play>.fas').classList.toggle("fa-pause");
    document.querySelector('#pause_play>.fas').classList.toggle("fa-play");
    document.querySelector('#start>.fas').classList.toggle("fa-stop");
    document.querySelector('#start>.fas').classList.toggle("fa-camera");
    document.querySelector('#timer_block').classList.toggle("hidden");
    if (!desktopSharing && in_process) {
        wnd = remote.getCurrentWindow();
        wnd.setSize(150,190)
        //When start recording
      timer(true);
      onAccessApproved(muted,selectedDevice);
    } else {
        //When stop recording
        desktopSharing = false;
      paused = false;
      timer(false);
      recorder.stop();
      if (localStream){
          console.log('localStream',localStream);
          localStream.getTracks()[0].stop();
          localStream = null;
      }
      if (!fs.existsSync(documents_path+'/rumpleRecorder')) {
          fs.mkdirSync(documents_path+'/rumpleRecorder');
      }
      //shell.openItem(files_path)
    }
}

//Play Recorded but not saved Video

function play(blobs) {
    var superBuffer = new Blob(blobs);
    videoElement =
        window.URL.createObjectURL(superBuffer);
    return videoElement;
}

//StopRecord Event
function stopRecording() {
    var blob = new Blob(blobs, {type: 'video/webm'});
    wnd = remote.getCurrentWindow();
    wnd.setSize(300,470)
    toArrayBuffer(blob, function(ab) {
        var buffer = toBuffer(ab);
        // var file = files_path + '/' + new Date().getTime() + '.webm';
        var file = play(blobs);
        var win = new BrowserWindow({
            width: 900,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        });
        win.loadFile('view/video_link.html');
        win.webContents.on('did-finish-load', () => {
            win.webContents.send('file', file);
            win.webContents.send('buffer', buffer);
        })
        // console.log('Saved video: ' + file);
        document.getElementById('hours').innerHTML = '00';
        document.getElementById('mins').innerHTML = '00';
        document.getElementById('secs').innerHTML = '00';
    });
}

function toArrayBuffer(blob, cb) {
    let fileReader = new FileReader();
    fileReader.onload = function() {
        let arrayBuffer = this.result;
        cb(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(blob);
}

function toBuffer(ab) {
    let buffer = Buffer.alloc(ab.byteLength);
    let arr = new Uint8Array(ab);
    for (let i = 0; i < arr.byteLength; i++) {
        buffer[i] = arr[i];
    }
    return buffer;
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

function onAccessApproved(muted,selectedDevice) {
  desktopSharing = true;
  let constraints;
    if(muted){
        constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'screen',
                    maxWidth: 1280,
                    maxHeight: 720,
                },
                pointsOfInterest: {x : 10, y: -50 }
            }
        }
    }else{
        let audio;
        if(selectedDevice){
            audio  = {
                deviceId:selectedDevice
            }
        }else{
            audio = true;
        }
        constraints = {
            audio: audio,
            video: false,
        }
    }
    navigator.getUserMedia(constraints, function(audioStream) {
        navigator.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'screen',
                    maxWidth: 1280,
                    maxHeight: 720,
                },
                pointsOfInterest: {x : 10, y: -50 }
            }
        }, handleVideoStream(audioStream), handleUserMediaError);
    }, function() {});

    function handleVideoStream(audioStream) {
        return function(videoStream) {
            if (audioStream) {
                let audioTracks = audioStream.getAudioTracks();
                if (audioTracks.length > 0) {
                    videoStream.addTrack(audioTracks[0]);
                }
            }
            recorder = new MediaRecorder(videoStream);
            blobs = [];
            recorder.ondataavailable = function(event) {
                if (event.data.size > 1) {
                    blobs.push(event.data);
                    stopRecording();
                }
            };
            recorder.start();
        };
    }

    function handleUserMediaError(e) {
        console.error('handleUserMediaError', e);
    }

}

document.querySelector('#start_capture').addEventListener('click', function(e) {
    document.querySelector('#record_block').classList.toggle("hidden");
});
document.querySelector('#cancel_record').addEventListener('click', function(e) {
    if(typeof recorder !== "undefined"){
        if(recorder.state === "recording" || recorder.state === "paused" || recorder.state === "inactive") {
            if(in_process){
                in_process = false;
            }else{
                in_process = true;
            }
            desktopSharing = false;
            timer(false);
            document.querySelector('#pause_play>.fas').classList.toggle("fa-pause");
            document.querySelector('#pause_play>.fas').classList.toggle("fa-play");
            document.querySelector('#start>.fas').classList.toggle("fa-stop");
            document.querySelector('#start>.fas').classList.toggle("fa-camera");
            document.querySelector('#timer_block').classList.toggle("hidden");
            document.getElementById('hours').innerHTML = '00';
            document.getElementById('mins').innerHTML = '00';
            document.getElementById('secs').innerHTML = '00';
            recorder.stream.removeTrack;
        }
    }else{
        document.querySelector('#record_block').classList.toggle("hidden");
    }

});
document.querySelector('#mute').addEventListener('click', function(e) {
    document.querySelector('#mute>.fas').classList.toggle("fa-microphone");
    document.querySelector('#mute>.fas').classList.toggle("fa-microphone-slash");
    if(muted){
        muted = false;
    }else{
        muted = true;
    }
});
document.querySelector('#pause_play').addEventListener('click', function(e) {
    if (typeof recorder !== "undefined"){
        if(recorder.state === "recording") {
            recorder.pause();
            paused = true;
            timer(false);
            document.querySelector('#pause_play>.fas').classList.toggle("fa-play");
            document.querySelector('#pause_play>.fas').classList.toggle("fa-pause");
            // recording paused
        } else if(recorder.state === "paused") {
            recorder.resume();
            timer(true);
            document.querySelector('#pause_play>.fas').classList.toggle("fa-pause");
            document.querySelector('#pause_play>.fas').classList.toggle("fa-play");
            // resume recording
        } else{
            console.log('Record isn\'t starting yet');
        }
    } else{
        console.log('Record isn\'t starting yet');
    }

});


$('select').change(function () {
    audioInputId = $(this).val();
})

$("#close_button").click(function () {
    remote.getCurrentWindow().close();
})
appReloadBtn  = document.querySelector('#reload_button');
appReloadBtn.addEventListener('click', e =>{
    currWindow.reload();
});
$('#open_folder').click(function () {
    if (!fs.existsSync(__dirname+'/upload')) {
        fs.mkdirSync(__dirname+'/upload');
    }
    shell.openItem(files_path)
    // if (!fs.existsSync(documents_path+'/rumpleRecorder')) {
    //     fs.mkdirSync(documents_path+'/rumpleRecorder');
    // }
    // shell.openItem(files_path)
})
