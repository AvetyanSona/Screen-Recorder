const fs = require('fs');
const https = require('https');
const shell = require('electron').shell;
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const {net} = require('electron').remote;
const querystring = require('querystring');
const serverUrl = 'http://localhost:9000/';

// function downloadVideo(buffer) {
//     var blob = new Blob([buffer], {type: 'video/webm'});
//     var file = new Date().getTime() + '.webm';
//     generated_number = file.replace('.webm', '');
//     $.get( serverUrl+'records_list.php?id='+generated_number )
//         .done(function( response ) {
//             if (response == 'success') {
//                 var fileReader = new FileReader();
//                 fileReader.onload = function(){
//                     var buffer = new Buffer(reader.result);
//                     fs.writeFile(__dirname + '/../upload/'+file, buffer, {}, (err, res) => {
//                         if(err){
//                             console.error(err);
//                             return
//                         }else {
//                             fileReader.readAsArrayBuffer(blob);
//                             var url = URL.createObjectURL(blob);
//                             var a = document.createElement('a');
//                             document.body.appendChild(a);
//                             a.style = 'display: none';
//                             a.href = url;
//                             a.download = file;
//                             a.click();
//                             window.URL.revokeObjectURL(url);
//                         }
//                     })
//                 };
//             } else if (response == 'exist') {
//                 return;
//             }
//         }).fail(function() {
//         alert('something wrong with connection');
//     });
// }
function downloadVideo(buffer) {
    var blob = new Blob([buffer], {type: 'video/webm'});
    var file = new Date().getTime() + '.webm';
    generated_number = file.replace('.webm', '');
    $.get( serverUrl+'records_list.php?id='+generated_number )
        .done(function( res ) {
            if (res == 'success') {
                var reader = new FileReader();
                reader.onload = function(){
                    var buffer = new Buffer(reader.result);
                    fs.writeFile(__dirname + '/../upload/'+file, buffer, {}, (err, res) => {
                        if(err){
                            console.error(err);
                            return
                        }else{
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
                    })
                };
                reader.readAsArrayBuffer(blob);
            } else if (res == 'exist') {
                return;
            }
        }).fail(function() {
        alert('something wrong with connection');
    });
}
function shareVideo(buffer) {
    var blob = new Blob([buffer], {type: 'video/webm'});
    var file = new Date().getTime() + '.webm';
    generated_number = file.replace('.webm', '');
    var loading = document.getElementById("loading");
    loading.style.display = "block";
    $.get( serverUrl+'records_list.php?id='+generated_number )
        .done(function( res ) {
            if (res == 'success') {
                var reader = new FileReader();
                reader.onload = function(){
                    console.log('here')
                    var buffer = new Buffer(reader.result);
                    fs.writeFile(__dirname + '/../upload/'+file, buffer, {}, (err, res) => {
                        if(err){
                            console.error(err);
                            return
                        }else{
                            var block = document.getElementById('buttonsBlock');
                            blockChild = document.createElement('div');
                            shareLink = document.createElement('a');
                            shareLink.href = serverUrl +'view/shared_video.php?id='+generated_number;
                            shareLink.textContent = 'Share video';
                            shareLink.className = 'btn  btn-block primary_button';
                            blockChild.className = 'col-6';
                            shareLink.id = 'shareLink';
                            loading.style.display = "none";
                            blockChild.appendChild(shareLink);
                            block.appendChild(blockChild);
                            document.querySelector('#shareLink').addEventListener('click', function () {
                                event.preventDefault();
                                shell.openExternal(shareLink.href);
                            })
                        }
                    })
                };
                reader.readAsArrayBuffer(blob);
            } else if (res == 'exist') {
                return;
            }
        }).fail(function() {
        alert('something wrong with connection');
    });
}
function cancelVideo() {
     remote.getCurrentWindow().close();
 }