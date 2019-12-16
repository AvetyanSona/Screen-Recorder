const fs = require('fs');
const shell = require('electron').shell;

function downloadVideo(blobs) {
    var blob = new Blob(blobs, {
        type: 'video/webm'
    });
    var file = new Date().getTime() + '.webm';
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = file;
    a.click();
    window.URL.revokeObjectURL(url);
}

function shareVideo(blobs) {
    var blob = new Blob(blobs, {
        type: 'video/webm'
    });
    var reader = new FileReader();
    var file = new Date().getTime() + '.webm';
    reader.onload = function(){
        var buffer = new Buffer(reader.result);
        fs.writeFile(__dirname + '/upload/'+file, buffer, {}, (err, res) => {
            if(err){
                console.error(err);
                return
            }else{
                var block = document.getElementById('buttonsBlock');
                blockChild = document.createElement('div');
                shareLink = document.createElement('a');
                shareLink.href = 'http://localhost:9990/upload/' + file;
                shareLink.textContent = 'Share video';
                shareLink.className = 'btn-secondary btn-lg btn-block';
                blockChild.className = 'col-6';
                shareLink.id = 'shareLink';
                blockChild.appendChild(shareLink);
                block.appendChild(blockChild);
                document.querySelector('#shareLink').addEventListener('click',function () {
                    event.preventDefault();
                    shell.openExternal(shareLink.href);
                });
                console.log('video saved');
            }
        })
    };
    reader.readAsArrayBuffer(blob);
}

// function toArrayBuffer(blob, cb) {
//     let fileReader = new FileReader();
//     fileReader.onload = function() {
//         let arrayBuffer = this.result;
//         cb(arrayBuffer);
//     };
//     fileReader.readAsArrayBuffer(blob);
// }
// function toBuffer(ab) {
//     let buffer = Buffer.alloc(ab.byteLength);
//     let arr = new Uint8Array(ab);
//     for (let i = 0; i < arr.byteLength; i++) {
//         buffer[i] = arr[i];
//     }
//     return buffer;
// }