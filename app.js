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
const app = remote.app;
const documents_path = app.getPath('documents');
const fs = require('fs');
if (!fs.existsSync(documents_path+'/rumpleRecorder')) {
    fs.mkdirSync(documents_path+'/rumpleRecorder');
}
const files_path = documents_path+'/rumpleRecorder';
let desktopSharing = false;
let localStream;
let recorder;
let  blobs = [];
let audioInputSelect;
let audioInputId;
let secs_block = document.querySelector("#secs");
let mins_block = document.querySelector("#mins");
let hours_block = document.querySelector("#hours");
let timer_;
let paused = false;
let secs = 0;
let mins = 0;
let hours = 0;

$(document).ready(function() {
    audioInputSelect = document.querySelector('select');
    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices)
        .catch(errorCallback);

    function gotDevices(deviceInfos) {
        for (let i = 0; i !== deviceInfos.length; ++i) {
            let deviceInfo = deviceInfos[i];
            let option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label ||
                    'Microphone ' + (audioInputSelect.length + 1);
                audioInputSelect.appendChild(option);
            } else if (deviceInfo.kind === 'audiooutput') {
                option.text = deviceInfo.label || 'Speaker ' +
                    (audioOutputSelect.length + 1);
                audioOutputSelect.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || 'Camera ' +
                    (videoSelect.length + 1);
                videoSelect.appendChild(option);
            }
        }
    }

    function  errorCallback(e) {

    }
});


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
            secs_block.innerHTML = secs;
            if(mins > 0) {
                mins_block.innerHTML = mins;
            }
            if(hours > 0) {
                hours_block.innerHTML = hours;
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


function toggle() {
  if (!desktopSharing) {
      document.querySelector('#pause_play>.fas').classList.toggle("fa-play");
      document.querySelector('#pause_play>.fas').classList.toggle("fa-pause");
      document.querySelector('#start>.fas').classList.toggle("fa-circle");
      document.querySelector('#start>.fas').classList.toggle("fa-stop");
      document.querySelector('#timer_block').classList.toggle("hidden");

      timer(true);
      onAccessApproved();
  } else {
      document.querySelector('#pause_play>.fas').classList.toggle("fa-pause");
      document.querySelector('#pause_play>.fas').classList.toggle("fa-play");
      document.querySelector('#timer_block').classList.toggle("hidden");

      desktopSharing = false;
    if (localStream)
      localStream.getTracks()[0].stop();
      localStream = null;
      paused = false;
      timer(false);
      recorder.stop();
      document.querySelector('#start>.fas').classList.toggle("fa-stop");
      document.querySelector('#start>.fas').classList.toggle("fa-circle");
      if (!fs.existsSync(documents_path+'/rumpleRecorder')) {
          fs.mkdirSync(documents_path+'/rumpleRecorder');
      }
      shell.openItem(files_path)
  }
}
function stopRecording() {
    var x = blobs;
    toArrayBuffer(new Blob(blobs, {type: 'video/webm'}), function(ab) {
        var buffer = toBuffer(ab);
        var file = files_path + '/' + new Date().getTime() + '.webm';
        fs.writeFile(file, buffer, function(err) {
            if (err) {
                console.error('Failed to save video ' + err);
            } else {
                console.log('Saved video: ' + file);
            }
        });
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

function onAccessApproved() {
  desktopSharing = true;
    navigator.webkitGetUserMedia({
        audio: true
    }, function(audioStream) {
        navigator.webkitGetUserMedia({
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
                blobs.push(event.data);
                stopRecording();
            };
            recorder.start();
        };
    }


    function handleUserMediaError(e) {
        console.error('handleUserMediaError', e);
    }

}



document.querySelector('#start').addEventListener('click', function(e) {
  toggle();
});

document.querySelector('#pause_play').addEventListener('click', function(e) {
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
    }
});


$('select').change(function () {
    audioInputId = $(this).val();
})

$("#close_button").click(function () {
    remote.getCurrentWindow().close();
})
$('#open_folder').click(function () {
    if (!fs.existsSync(documents_path+'/rumpleRecorder')) {
        fs.mkdirSync(documents_path+'/rumpleRecorder');
    }
    shell.openItem(files_path)
})
