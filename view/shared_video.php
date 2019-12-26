<?php
require_once '../config.php';
session_start();
if(isset($_GET['id'])){
    $id = $_GET['id'];
    $res = mysqli_query($con,"SELECT * FROM records_list where generated_number = '$id'");
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
    <?php if ($data) : ?>
    <div class="container-fluid">
        <video id="sharedVideo" src ="../<?=$data->path?>" controls="true" autoplay="true" style="width: 100%;height: 100%"></video>
    </div>
    <?php endif; ?>
    <?php if (!$data) : ?>
       <div class="col-12 mt-5">
           <div class="alert alert-light text-center" role="alert">
               <strong >There is no video </strong>. Please try with another url.
           </div>
       </div>
    <?php endif; ?>
</body>
<script src="../assets/js/videoHandling.js"></script>
</html>