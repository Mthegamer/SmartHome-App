<?php
require_once("db.inc.php");
/*********************************************
Fetch the list of settings and their current values for a specific
zone.

REQUIRES: uuid from device and username for the installation, and 
            the id of the zone to be fetched

RETURNS: jsonp object that calls a function called 
        showZoneValues.
        There will always be a code item at the root level.
        If the code is zero all is good
SAMPLE
http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?uuid=abcdef123456&username=abcd0001&zone=2        
*********************************************/

header("Content-type: application/json");

if( isset($_REQUEST['zone']) && isset($_REQUEST['uuid']) && isset($_REQUEST['username']) && ctype_digit($_REQUEST['zone']) ){
    
    $zid = intval($_REQUEST['zone']);
    $uuid = trim($_REQUEST['uuid']);
    $username = trim($_REQUEST['username']);
    
    $rsZ=$pdo->prepare("SELECT title FROM final_zones WHERE zone_id=?");
    $rsZ->execute(array($zid));
    $rowZ = $rsZ->fetch();
    $title = $rowZ['title'];

    $recordset = $pdo->prepare( "SELECT s.setting_id, s.setting_title, hi.value, s.setting_key, s.data_type  
            FROM final_settings as s INNER JOIN final_home_items as hi
            ON s.setting_id = hi.setting_id INNER JOIN final_homes as fh
            ON hi.home_id = fh.home_id 
            WHERE s.zone_id=? 
            AND fh.uuid=?
            AND fh.username=?
            ORDER BY s.setting_key");
    

    if($recordset->execute( array($zid, $uuid, $username) )){
        echo 'showZoneValues({"code":0, "zone":' . $zid . ', "zone_title":"' . $title . '", "values":[';
        $rows = array();
        while($row = $recordset->fetch() ){
            $rows[] = '{"setting_id":' . $row['setting_id'] . ',"setting_title":"' . $row['setting_title'] . '", "setting_key":"' . $row['setting_key'] . '", "current_value":' . $row['value'] . ',"data_type":"' . $row['data_type'] . '"}';
        }
        echo implode(",", $rows);
        echo ']})';
    }else{
        $err = $recordset->errorInfo();
        echo 'showZoneValues({"code": 989, "message":"' . $err[2] . '"})';
    }

    
    
}else{
    
    echo 'showZoneValues({"code": 333, "message":"Missing required parameters."})';
}
?>