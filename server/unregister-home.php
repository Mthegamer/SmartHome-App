<?php
/*********************************************
Deletes a home entry in the database.


REQUIRES: uuid from device and username for the installation 
        as well as a pin number 

RETURNS: jsonp object that calls a function called 
        deleteDone.
        There will always be a code item at the root level.
        If the code is zero all is good
SAMPLE
http://faculty.edumedia.ca/griffis/mad9022/final-server/set-value.php?uuid=abcdef123456&username=abcd0001&pin=1234
*********************************************/
require_once("db.inc.php");
header("Content-type:application/json");

if( isset($_REQUEST['uuid']) && isset($_REQUEST['username']) && isset($_REQUEST['pin'])){
    //with this information we can register a device
    $pin = trim($_REQUEST['pin']);
    $uuid = trim($_REQUEST['uuid']);
    $username = trim($_REQUEST['username']);
    
    //make sure that pin is 4 chars, username is 8 chars.
    if(!empty($pin) && !empty($uuid) && !empty($username) && strlen($pin)==4 && strlen($username)==8){
        //data is good. 
        //check to make sure that the uuid + username combo has not already been created...
        $rsChk = $pdo->prepare("DELETE FROM final_homes WHERE uuid=? AND username=? AND pin=?");
        if($rsChk->execute(array($uuid, $username, $pin))){
            //check the number of rows affected
            if($rsChk->rowsCount() > 0){
                //denied
                echo 'deleteDone({"code": 0, "message":"Account successfully deleted from the server."})';   
                exit();
            }
        }else{
            //cannot confirm if the account is valid
            echo 'deleteDone({"code": 248, "message":"Unable to delete the account."})';    
            exit();
        }
        
    }else{
        echo 'deleteDone({"code": 543, "message":"Invalid parameters."})';    
    }
}else{
    //missing the required information
    echo 'deleteDone({"code": 333, "message":"Missing required parameters."})';
}
?>