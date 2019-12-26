<?php
require_once 'config.php';
session_start();

if (isset($_GET['id'])) {
    $generated_number = $_GET['id'];
    $path = 'upload/' . $generated_number . '.webm';
    $created_at = date("Y-m-d h:i:s");
    $record_url = 'http://localhost:9000/view/shared_video.php?id=' . $generated_number;
    $result = mysqli_query($con, "SELECT * FROM records_list WHERE generated_number = '$generated_number'");
    if (mysqli_num_rows($result) == 0) {
        $insert = mysqli_query($con, "INSERT INTO records_list (generated_number,path,created_at,record_url) VALUES ('$generated_number','$path','$created_at','$record_url')");
        if ($insert) {
            echo 'success';
        }
    } else {
        echo 'exist';
    }
}
?>