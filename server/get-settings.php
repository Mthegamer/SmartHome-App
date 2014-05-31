<?php
/*********************************************
fetch the list of settings and their default values
REQUIRES: uuid from device and username for the installation

RETURNS: jsonp object that calls a function called saveSettings.
        There will always be a code item at the root level.
        If the code is zero all is good
        
SAMPLE
http://faculty.edumedia.ca/griffis/mad9022/final-server/get-settings.php?uuid=abcdef123456&username=abcd0001
*********************************************/

require_once("db.inc.php");



header("Content-type: application/json");

if( isset($_REQUEST['uuid']) && isset($_REQUEST['username'])){
    
    $recordset = $pdo->prepare( "SELECT setting_id, setting_title, setting_key, zone_id, data_type, default_value 
        FROM final_settings 
        ORDER BY zone_id, setting_key");
    $recordset->execute( array() );
    
    if($recordset){
        echo 'saveSettings({"code":0, "settings":[';

        $rows = array();
        while($row = $recordset->fetch() ){
            $rows[] = '{"setting_id":' . $row['setting_id'] . ',"setting_title":"' . $row['setting_title'] . '", "setting_key":"' . $row['setting_key'] . '", "zone_id":' . $row['zone_id'] . ',"data_type":"' . $row['data_type'] . '", "default_value":"' . $row['default_value'] . '"}';
        }
        echo implode(",", $rows);
        echo ']})';

    }else{
        echo 'saveSettings({"code": 123, "message":"Unable to retrieve list of setting items for your home."})';
    }

}else{
    echo 'saveSettings({"code": 456, "message":"Missing the account parameter."})';
}
?>