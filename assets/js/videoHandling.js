const fs = require('fs');
const https = require('https');
const shell = require('electron').shell;
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const {net} = require('electron').remote;
const querystring = require('querystring');

function downloadVideo(buffer) {
    var blob = new Blob([buffer], {type: 'video/webm'});
    var file = new Date().getTime() + '.webm';
    var reader = new FileReader();
    reader.onload = function(){
        var buffer = new Buffer(reader.result);
        fs.writeFile(__dirname + '/../upload/'+file, buffer, {}, (err, res) => {
            if(err){
                console.error(err);
                return
            }else{
                generated_number = file.replace('.webm', '');
                createRecordRequest(generated_number);
                console.log('video saved');
            }
        })
    };
    reader.readAsArrayBuffer(blob);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = file;
    a.click();
    window.URL.revokeObjectURL(url);
}

function shareVideo(buffer) {
    var blob = new Blob([buffer], {type: 'video/webm'});
    var file = new Date().getTime() + '.webm';
    var reader = new FileReader();
    reader.onload = function(){
        var buffer = new Buffer(reader.result);
        fs.writeFile(__dirname + '/../upload/'+file, buffer, {}, (err, res) => {
            if(err){
                console.error(err);
                return
            }else{
                var block = document.getElementById('buttonsBlock');
                blockChild = document.createElement('div');
                shareLink = document.createElement('a');
                // shareLink.href = 'http://localhost:9990/upload/' + file;
                generated_number = file.replace('.webm', '');
                shareLink.href = 'http://localhost:9000/view/shared_video.php?id='+generated_number;
                shareLink.textContent = 'Share video';
                shareLink.className = 'btn  btn-block primary_button';
                blockChild.className = 'col-6';
                shareLink.id = 'shareLink';
                createRecordRequest(generated_number);
                blockChild.appendChild(shareLink);
                block.appendChild(blockChild);
                document.querySelector('#shareLink').addEventListener('click', function () {
                    event.preventDefault();
                    shell.openExternal(shareLink.href);
                });
                console.log('video saved');
            }
        })
    };
    reader.readAsArrayBuffer(blob);
}
 function cancelVideo() {
     remote.getCurrentWindow().close();
 }

function createRecordRequest(id){
    let body = '';
    let response = '';
    var postData = querystring.stringify({
        'id' : id,
    });
    const request = net.request({
        method: 'GET',
        url: 'http://localhost:9000/records_list.php?'+postData,
    });
    request.on('error', (error) => {
        console.log('error');
        response = 'error';
    });
    request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`)
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
        response.on('data', (chunk) => {
            console.log(`body:${chunk}`);
            body += chunk.toString()
            response = body;
        })
        // when response is complete, print body
        response.on('end', () => {
            console.log(`BODY: ${body}`);
            response = `${body}`;
        })
    })
    request.write(postData);
    request.end();
}