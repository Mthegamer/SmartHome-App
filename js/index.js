// JavaScript Document


//----- Variables -----//
var db = null;
var links = [];
var zones = [];
var controls = [];
var pins = [];
var numLinks = 0;
var numZones = 0;
var numControls = 0;
var numPins = 0;
var pinNumber = "";
var userUUID = "";
var username = "";
var userpin = "";
var userName = ""; //--> username variable only for registration 
var userPin = ""; //--> userpin variable only for registration


//----- Custom Event -----//
var pageshow = document.createEvent("Event");
pageshow.initEvent("pageshow", true, true);


//----- Start App -----//
window.addEventListener("DOMContentLoaded", init);


function init(){
    document.addEventListener("touchmove", function(ev){ ev.preventDefault(); }, false);
    document.addEventListener("deviceready", onDeviceReady);
    //checkDB();
}


function onDeviceReady(){
    userUUID = device.uuid;
    checkDB();
}


function checkDB(){
    db = openDatabase('my_DB', '', 'Final DB', 1024*1024);
    
    if( db.version == '' ){
        setUpApp();
        loadPage("register");
    } else{
        setUpApp();
        
        db.transaction(function(trans){
            trans.executeSql('SELECT username, userpin FROM users', [],
                function(tx,rs){
                    username = rs.rows.item(0).username;
                    userpin = rs.rows.item(0).userpin;
                },
                function(err){
                    //console.log("Failed to execute Sql Query!");
                }
            );
        }, transError, transSuccess);
        
        if( localStorage["currentSetting"] !== "undefined" ){
            var pinlock = document.querySelector("#pinlock");
            var currentSetting = parseInt(localStorage["currentSetting"]);
            if( currentSetting == 1 ){
                pinlock.checked = true;
                loadPage("locked");
            } else{
                pinlock.checked = false;
                loadPage("home");
            }
        }
    }
}


function setUpApp(){
    links = document.querySelectorAll('[data-role="link"]');
    zones = document.querySelectorAll('[data-role="zone"]');
    controls = document.querySelectorAll('[data-role="control"]');
    pins = document.querySelectorAll('a.num');
    numLinks = links.length;
    numZones = zones.length;
    numControls = controls.length;
    numPins = pins.length;
    
    var functionArray = [temperature, lights, garage, doors, alarm, appliances];
    for(var z=0; z<numZones; z++){
        document.querySelector("#" + zones[z].id).addEventListener("pageshow", functionArray[z]);
    }
    
    document.querySelector("#pinlock").addEventListener("change", changeSettings);
    
    for(var c=0; c<numControls; c++){
        $(controls[c]).bind("change", setValues);
    }
    
    if( detectTouchSupport() ){
        for(var l=0; l<numLinks; l++){
            $(links[l]).bind("tap", handleClick);
        }
        for(var p=0; p<numPins; p++){
            $(pins[p]).bind("tap", checkPIN);
        }
        $("#submitBtn").bind("tap", registerUser);
        $(".tempBtn").bind("tap", changeTempValue);      
        $("#backBtn").bind("tap", function(ev){
            ev.preventDefault();
            loadPage("home");
        });
        $("#settingBtn").bind("tap", function(ev){
            ev.preventDefault();
            loadPage("setting");
        });
    } else{
        for(var l=0; l<numLinks; l++){
            $(links[l]).bind("click", handleClick);
        }
        for(var p=0; p<numPins; p++){
            $(pins[p]).bind("click", checkPIN);
        }
        $("#submitBtn").bind("click", registerUser);
        $(".tempBtn").bind("click", changeTempValue);
        $("#backBtn").bind("click", function(ev){
            ev.preventDefault();
            loadPage("home"); 
        });
        $("#settingBtn").bind("click", function(ev){
            ev.preventDefault();
            loadPage("setting");
        });
    }
    
    var passInput = document.querySelector('input[type="password"]');
    passInput.addEventListener("focus", function(){
        document.querySelector("form h2").style.display = "none"; 
    });
    passInput.addEventListener("blur", function(){
        document.querySelector("form h2").style.display = "block"; 
    });
}


function handleClick(ev){
    ev.preventDefault();
    var href = ev.currentTarget.href;
    var parts = href.split("#");
    var id = "#" + parts[1];
    loadPage(parts[1]);
    document.querySelector(id).dispatchEvent(pageshow);
}


function loadPage(pageid){
    if( pageid == "home" ){
        document.querySelector("#home").className = "active";
        document.querySelector("#setting").className = "";
        document.querySelector("#locked").className = "";
        document.querySelector("#register").className = "";
        document.querySelector("#backBtn").className = "";
        document.querySelector("#settingBtn").className = "active";
        document.querySelector("header").style.display = "block";
        document.querySelector("header h1").innerHTML = "SmartHome App";
        for(var p=0; p<numZones; p++){
            zones[p].className = "";
        }
    } else if( pageid == "setting" ){
        document.querySelector("#setting").className = "active";
        document.querySelector("#home").className = "";
        document.querySelector("#backBtn").className = "active";
        document.querySelector("#settingBtn").className = "";
    } else if( pageid == "register" ){
        document.querySelector("#register").className = "active";
        document.querySelector("#home").className = "";
        document.querySelector("header").style.display = "none";
    } else if( pageid == "locked" ){
        document.querySelector("#locked").className = "active";
        document.querySelector("#home").className = "";
        document.querySelector("header").style.display = "none";
    } else{
        for(var p=0; p<numZones; p++){
            if( pageid == zones[p].id ){
                zones[p].className = "active";
                document.querySelector("#home").className = "";
                document.querySelector("#backBtn").className = "active";
                document.querySelector("#settingBtn").className = "";
            } else{
                zones[p].className = "";
                document.querySelector("#locked").className = "";
            }
        }
    } 
}


function registerUser(ev){
    ev.preventDefault();
    userName = document.querySelector("input#username").value;
    userPin = document.querySelector("input#pin").value;
    
    if( userName == "" && userPin == "" ){
        document.querySelector(".errorMessage").innerHTML = "Please enter an username and pin!";
    } else{
        $.ajax({
            url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/register-home.php?",
            type: "post",
            dataType: "jsonp",
            data: "uuid=" + userUUID + "&username=" + userName + "&pin=" + userPin,
            jsonpCallback: "registrationDone",
            beforeSend: function(){
                $("#ajaxLoader").show(); 
            },
            complete: function(){
                setTimeout(function(){
                    $("#ajaxLoader").hide();
                }, 500);   
            }
        }).fail(badCall);
    }
}


function registrationDone(data){
    if( parseInt(data.code) == 0 ){
        //console.log("Successfully registered new user!");
        
        $.ajax({
            url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-settings.php?",
            type: "post",
            dataType: "jsonp",
            data: "uuid=" + userUUID + "&username=" + userName,
            jsonpCallback: "saveSettings",
            beforeSend: function(){
                $("#ajaxLoader").show(); 
            },
            complete: function(){
                setTimeout(function(){
                    $("#ajaxLoader").hide();
                }, 500);   
            }
        }).fail(badCall);
        
        db.changeVersion('', '1.0',
            function(trans){
                trans.executeSql('CREATE TABLE IF NOT EXISTS users(username TEXT, userpin INTEGER)', [],
                    function(tx,rs){
                        //console.log("Table successfully created!");
                    },
                    function(err){
                        alert("Failed to create table!");
                    }
                );
                trans.executeSql('INSERT INTO users(username, userpin) VALUES(?, ?)', [userName, userPin],
                    function(tx,rs){
                        //console.log("Successfully inserted new user!");
                    },
                    function(err){
                        alert("Failed to insert new user!");
                    }
                );
            },
            function(err){
                alert("Failed to change db version!");
            }
        );
        
        loadPage("home");
    } else{
        document.querySelector(".registerError").innerHTML = "That username has already exists!";
    }
}


function saveSettings(data){
    if( parseInt(data.code) == 0 ){
        //console.log("Default settings data successfully fetched!");
        
        for(var c=0; c<numControls; c++){
            controls[c].value = data.settings[c].default_value;
            if( data.settings[c].default_value == 1 ){                     
                controls[c].checked = true;
            } else{
                controls[c].checked = false;
            }
        }
    } else{
        alert("Failed to get default settings data!");
    }
}


function changeSettings(){
    var checked = this.checked;
    var settingMessage = document.querySelector(".settingMessage");
    
    if( checked ){
        checked = true;
        localStorage.setItem("currentSetting", 1);
        settingMessage.innerHTML = "If you enable the PIN lock, the PIN will be the same as the PIN you used in the registration";
    } else{
        checked = false;
        localStorage.setItem("currentSetting", 0);
        settingMessage.innerHTML = "";
    }
}


function checkPIN(ev){
    ev.preventDefault();
    var pin = ev.currentTarget;
    var digit = pin.getAttribute("data-num");
    var display = document.querySelector(".display");
    
    if( pinNumber.length < 5 ){
        pinNumber += digit 
        var span = document.createElement("span");
        span.innerHTML = "*";
        display.appendChild(span);
    }   
    
    if( pinNumber.length == 4 ){
        if( pinNumber == userpin ){
            setTimeout(function(){
                loadPage("home");   
            }, 100);  
        } else{
            document.querySelector(".pinError").innerHTML = "Wrong PIN. Please try again";
            pinNumber = "";
            display.innerHTML = "";
        }
    }
}


function temperature(){
    //alert("Temperature function triggered!");
    getZoneValues(1);
    document.querySelector("#temperature").removeEventListener("pageshow", temperature);
}


function lights(){
    //alert("Lights function triggered!");
    getZoneValues(2);
    document.querySelector("#lights").removeEventListener("pageshow", lights);
}


function garage(){
    //alert("Garage function triggered!");
    getZoneValues(3);
    document.querySelector("#garage").removeEventListener("pageshow", garage);
}


function doors(){
    //alert("Doors function triggered!");
    getZoneValues(4);
    document.querySelector("#doors").removeEventListener("pageshow", doors);
}


function alarm(){
    //alert("Alarm function triggered!");
    getZoneValues(5);
    document.querySelector("#alarm").removeEventListener("pageshow", alarm);
}


function appliances(){
    //alert("Appliances function triggered!");
    getZoneValues(6);
    document.querySelector("#appliances").removeEventListener("pageshow", appliances);
}


function getZoneValues(zone){
    $.ajax({
        url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?",
        type: "post",
        dataType: "jsonp",
        data: "uuid=" + userUUID + "&username=" + username + "&zone=" + zone,
        jsonpCallback: "showZoneValues",
        beforeSend: function(){
            $("#ajaxLoader").show(); 
        },
        complete: function(){
            setTimeout(function(){
                $("#ajaxLoader").hide();
            }, 500);   
        }
    }).fail(badCall);
}


function showZoneValues(data){
    if( parseInt(data.code) == 0 ){
        //console.log("Zones data successfully fetched!"); 
        
        var sets = [];
        var totalData = data.values.length;
        var zone = data.zone;
        
        switch(zone){
            case 1:
                //console.log("Temperature");
                sets = document.querySelectorAll(".tempSets");
                break;
            case 2:
                //console.log("Lights");
                sets = document.querySelectorAll(".lightSets");
                break;
            case 3:
                //console.log("Garage");
                sets = document.querySelectorAll(".garageSet");
                break;
            case 4:
                //console.log("Doors");
                sets = document.querySelectorAll(".doorSets");
                break;
            case 5:
                //console.log("Alarm");
                sets = document.querySelectorAll(".alarmSet");
                break;
            case 6:
                //console.log("Appliances");
                sets = document.querySelectorAll(".applianceSets");
                break;
            default:
                alert("There is no match!");
        }
        
        for(var i=0; i<totalData; i++){
            sets[i].value = data.values[i].current_value;
            if( data.values[i].current_value == 1 ){
                sets[i].checked = true;
            } else{
                sets[i].checked = false;
            }
        }
    } else{
        alert("Failed to get zones data!");
    }
}


function changeTempValue(ev){
    var tempControl = document.querySelector("#prop-20");
    var tempValue = tempControl.valueAsNumber;
    var id = ev.currentTarget.id;
    if( id == "minusBtn" ){
        tempValue -= 1;
        tempControl.stepDown(1);
        setTempValue(tempValue);
    } 
    if( id == "plusBtn" ){
        tempValue += 1;
        tempControl.stepUp(1);
        setTempValue(tempValue);
    }
}


function setTempValue(value){
    $.ajax({
        url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/set-value.php?",
        type: "post",
        dataType: "jsonp",
        data: "uuid=" + userUUID + "&username=" + username + "&prop=20&val=" + value,
        jsonpCallback: "propertyValueSet",
        beforeSend: function(){
            $("#ajaxLoader").show(); 
        },
        complete: function(){
            setTimeout(function(){
                $("#ajaxLoader").hide();
            }, 500);   
        }
    }).fail(badCall);
}


function setValues(ev){
    var id = ev.currentTarget.id;
    var prop = id.split("prop-");
    var value = ev.currentTarget.value;
    var checked = ev.currentTarget.checked;
    
    if( id !== "prop-20" ){
        if( checked ){
            value = 1;
        } else{
            value = 0;
        }
    } else{
        value = parseInt(value);
    }
    
    $.ajax({
        url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/set-value.php?",
        type: "post",
        dataType: "jsonp",
        data: "uuid=" + userUUID + "&username=" + username + "&prop=" + prop[1] + "&val=" + value,
        jsonpCallback: "propertyValueSet",
        beforeSend: function(){
            $("#ajaxLoader").show(); 
        },
        complete: function(){
            setTimeout(function(){
                $("#ajaxLoader").hide();
            }, 500);   
        }
    }).fail(badCall);
}


function propertyValueSet(data){
    if( parseInt(data.code) == 0 ){
        //console.log(data.message);
    }
}


function badCall(jqXHR, textStatus, errorThrown){
   alert("Failed to make AJAX call!");
}


function transError(tx, err){
    alert('Fatal error!');
}


function transSuccess(){
    // Transaction Success!
}


function detectTouchSupport(){
	msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
	var touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
	return touchSupport;
}