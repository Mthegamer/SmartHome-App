<?php
/*********************************************
Creates a new home entry in the database.
Copies the default values from the final_settings table
and inserts them into the final_home_items table

REQUIRES: uuid from device and username for the installation 
        as well as a pin number if the user wants to set a
        PIN for their application

RETURNS: jsonp object that calls a function called 
        registrationDone.
        There will always be a code item at the root level.
        If the code is zero all is good
SAMPLE
http://faculty.edumedia.ca/griffis/mad9022/final-server/set-value.php?uuid=abcdef123456&username=abcd0001&pin=1234
*********************************************/
require_once("db.inc.php");
header("Content-type:application/javascript");

if( isset($_REQUEST['uuid']) && isset($_REQUEST['username']) && isset($_REQUEST['pin'])){
    //with this information we can register a device
    $pin = trim($_REQUEST['pin']);
    $uuid = trim($_REQUEST['uuid']);
    $username = trim($_REQUEST['username']);
    
    //make sure that pin is 4 chars, username is 8 chars.
    if(!empty($pin) && !empty($uuid) && !empty($username) && strlen($pin)==4 && strlen($username)==8){
        //data is good. 
        //start transaction
        $pdo->beginTransaction();
        //check to make sure that the uuid + username combo has not already been created...
        $rsChk = $pdo->prepare("SELECT COUNT(*) AS cnt FROM final_homes WHERE uuid=? AND username=?");
        if($rsChk->execute(array($uuid, $username))){
            //check the count
            $rowChk = $rsChk->fetch();
            if($rowChk['cnt'] > 0){
                //denied
                echo 'registrationDone({"code": 999, "message":"Account already exists on the server."})';   
                $pdo->rollBack();
                exit();
            }
        }else{
            //cannot confirm if the account is valid
            echo 'registrationDone({"code": 842, "message":"Unable to confirm if account is valid. No account created."})';    
            $pdo->rollBack();
            exit();
        }
        
        
        //Add info to the final_homes table
        //$today = time();
        $rs = $pdo->prepare("INSERT INTO final_homes(uuid, pin, username, create_dt) 
                VALUES(?, ?, ?, NOW())");
        if($rs->execute(array($uuid, $pin, $username))){
            //Add the default MASK values to the final_home_items table
            $hid = $pdo->lastInsertId();
            $rsm = $pdo->prepare("INSERT INTO final_home_items(home_id, setting_id, value)
                SELECT ?, setting_id, default_value FROM final_settings");
            if($rsm->execute(array($hid))){
                //good to go
                echo 'registrationDone({"code":0, "message":"Home Account Created", "home_id":' . $hid . '})';
                $pdo->commit();
            }else{
                //failed to set defaults
                $pdo->rollBack();
                echo 'registrationDone({"code": 714, "message":"Unable to set initial propery values. No account created."})';    
            }
        }else{
            //unable to create the account
            $err = $rs->errorInfo();
            $pdo->rollBack();
            echo 'registrationDone({"code": 624, "message":"Unable to create account on server. ' . $err[2] . '"})';    
        }
    }else{
        echo 'registrationDone({"code": 543, "message":"Invalid parameters."})';    
    }
}else{
    //missing the required information
    echo 'registrationDone({"code": 333, "message":"Missing required parameters."})';
}
?>