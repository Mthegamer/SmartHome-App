<?php
/*********************************************
Sets a value for a property belonging to a specific home

REQUIRES: uuid from device and username for the installation 
        as well as the setting_id and the value

RETURNS: jsonp object that calls a function called 
        propertyValueSet.
        There will always be a code item at the root level.
        If the code is zero all is good
SAMPLE
http://faculty.edumedia.ca/griffis/mad9022/final-server/set-value.php?uuid=abcdef123456&username=abcd0001&prop=20&val=17
*********************************************/
require_once("db.inc.php");


header("Content-type: application/json");

if( isset($_REQUEST['prop']) && isset($_REQUEST['val']) && isset($_REQUEST['uuid']) && isset($_REQUEST['username'])){
    
    $prop = intval($_REQUEST['prop']);  //the setting_id in the final_home_items table
    $value = trim($_REQUEST['val']);  //the value in the final_home_items table
    $uuid = trim($_REQUEST['uuid']);    //which installation
    $username = trim($_REQUEST['username']);    //help avoid conflicts for the class version
    
    $trans = $pdo->beginTransaction();
    //fetch the datatype to do validation on the value
    $datatype = "";
    $m_val = "";
    $rs1 = $pdo->prepare("SELECT data_type, setting_key FROM final_settings
                    WHERE setting_id=?");
    if($rs1->execute(array($prop))){
        $row = $rs1->fetch();
        $datatype = $row['datatype'];
        $s_key = $row['setting_key'];
    }else{
        $pdo->rollBack();
        echo 'propertyValueSet({"code": 444, "message":"Unable to find a matching property."})';
        exit();
    }
    
    //do the validation
    $valid = true;
    switch($datatype){
        case 'boolean':
            if(!ctype_digit($value)){
                $valid = false;
                break;
            }
            if(intval($value) > 1 || intval($value) < 0){
                $valid = false;
                break;
            }
            $value = intval($value);
            break;
        case 'number':
            if(!ctype_digit($value)){
                $valid = false;
                break;
            }
            $value = intval($value);
            break;
        case 'text':
            if(!ctype_alnum($value)){
                $valid = false;
                break;
            }
    }
    if(!$valid){
        $pdo->rollBack();
        echo 'propertyValueSet({"code": 555, "message":"Invalid property value."})';
        exit();
    }
    
    //if we made it this far then SET the value for the property in final_home_items
    $recordset = $pdo->prepare( "UPDATE final_home_items
            SET value=?
            WHERE setting_id=? 
            AND home_id=(SELECT home_id FROM final_homes WHERE uuid=? AND username=?)");
    if($recordset->execute( array($value, $prop, $uuid, $username) ) ){
        $pdo->commit();
        echo 'propertyValueSet({"code":0, "property":"' . $prop . '","value":"' . $value . '","code":0,"message":"Property value set."})';
        exit();
    }else{
        $pdo->rollBack();
        echo 'propertyValueSet({"code": 667, "message":"Unable to set property value ' . $prop . '."})';
        exit();
    }
}else{
    echo 'propertyValueSet({"code": 333, "message":"Missing required parameters."})';
}
?>