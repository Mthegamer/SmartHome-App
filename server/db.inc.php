<?php
//db.inc.php
session_start();

$dbhost = "localhost";
$dbuser = "mad9022";
$dbpass = "mad9022";
$dbname = "mad9022";

try{
    $pdo = new PDO("mysql:host=" . $dbhost . ";dbname=" . $dbname, $dbuser, $dbpass);
}
catch( PDOException $Exception ) {
    // PHP Fatal Error. Second Argument Has To Be An Integer, But PDOException::getCode Returns A
    // String.
    echo "<p>" . $Exception->getMessage( ) . "</p>"; 
    echo "<p>" . $Exception->getCode( ) . "</p>";
    exit();
}

?>