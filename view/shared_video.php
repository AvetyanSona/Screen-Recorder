<?php
require_once '../config.php';
session_start();
if(isset($_GET['id'])){
    $id = $_GET['id'];
    $res = mysqli_query($con,"SELECT path FROM records_list where generated_number = '$id'");
    $data = mysqli_fetch_object($res);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <link href="../assets/css/bootstrap.min.css" rel="stylesheet">
    <meta charset="UTF-8">
    <title>Your Captured Video</title>
</head>
<body>
    <video id="sharedVideo" src ="../<?=$data->path?>" controls="true" autoplay="true" style="width: 100%;height: 100%">

    </video>
</body>
<script>
    // const electron = require('electron');
    // electron.ipcRenderer.on('sharedVideo', (event, file) => {
    //     document.querySelector("#sharedVideo").setAttribute("src", file);
    // });
</script>
<script src="../assets/js/videoHandling.js"></script>
</html>