<?php

/*

PHP script for inclusion with the Web Map Application prototype. 
Developed by Andrew Roberts 2017, for Professor X. 
FirePHP console commands for logging php activity:
FB::log('Log Message');
FB::info('Info Message');
FB::warn('Warn Message');
FB::error('Error Message');
FB::trace('Simple Trace');

*/

// Include the FirePHP debugging script
require('../../lib/fb/fb.php');


// Catch the passed in properties
$selectType = $_REQUEST["selectType"];
$extentData = $_REQUEST["extentData"];
$layers = $_REQUEST["layers"];


function ping($url) {
    $pingResult = exec("ping -c 1 $url", $outcome, $status);
    if (0 == $status) {
        fb::log($status);
        fb::log($outcome);
        $status = "alive";
    } else {
        $status = "dead";
    }
    return($status);
}


function curlPostGeoServer($layer, $extentData) {
    
    // Setup our GET url for GeoServer
    // Modify this url for specific data server ***
    //
    $url = 'http://ulysses.agr.gc.ca:8080/geoserver/ows?service=WCS&version=2.0.1&request=GetCoverage&CoverageId=Canada__' . $layer . '&subset=Long('. $extentData[0] . ',' . $extentData[2] . ')&subset=Lat(' . $extentData[1] . ',' . $extentData[3] . ')';
    
    
    $ch = curl_init($url); 
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml')); curl_setopt($ch, CURLOPT_HEADER, 0); 
    curl_setopt($ch, CURLOPT_GET, 1); 
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0); 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
    $ch_result = curl_exec($ch);      
    
        
    // Setup error check. Returned cURL data should be a GeoTIFF if successful. 
    // If there's an error, GeoServer returns an XML. Here, we check if XML 
    // 
    // Create XML reader object and load in returned cURL data 
    $reader = new XMLReader(); 
    $reader->xml($ch_result); 

    
    // If XMLReader can read(returns TRUE), cURL data was XML and we send an error report 
    if($reader->read()){ 
        // Write error report to error log, including returned XML 
        $errMsg = "\n\n" . date("Y-m-d H:i:s ") . " ERROR" . $_SERVER["REQUEST_TIME "]
                  . "\n\t " . __FILE__ . "\n\t Request XML error: POST request returned without a valid GeoTIFF.\n\t Refer to XML for info:\n\t XML Response:\n\t url: {$url}\n\t xml:\n\t {$ch_result} ";
        
        file_put_contents("error/errorlog.txt ", $errMsg, FILE_APPEND); 
        return("*GeoTiff save failed - Contact Server Administrator "); 
        
    } else { 
        // Apply time-stamp to file and save 
        $fileName = "temp/" . $layer . "_" . date("This") . ".tif ";         
        file_put_contents($fileName, $ch_result); 
        return($fileName); 
    } 
    return($url);
    
} // close curlPostGeoServer()

$func = curlPostGeoServer($layers[0], $extentData);

fb::log($layers);
fb::log(json_encode(array($selectType, $extentData[0], $layers, $func)));





?>