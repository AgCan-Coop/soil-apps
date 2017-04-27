<?php

#-------------------------------------------------------
# This code uses zip, curl and xml php libraries and a python 
# subprocess to retrieve data from the Agriculture Canada data 
# server ulysses.agr.gc.ca. Data is saved as a zip to daedalus.agr.gc 
# and downloaded from there by the user. Specific data heirarchy 
# is assumed. Script returns fail message, or .zip link.
# Zip function from davidwalse.name/create-zip-php

# Created for inclusion with the Data Portal prototype. 
# Author: Andrew Roberts 
# Modified: 2017-04-27

# FirePHP console commands for logging php activity:
# FB::log('Log Message');
# FB::info('Info Message');
# FB::warn('Warn Message');
# FB::error('Error Message');
# FB::trace('Simple Trace');
#-------------------------------------------------------


// Include the FirePHP debugging script
require('../../lib/fb/fb.php');


// Catch the passed in properties
$selectType = $_REQUEST["selectType"];
$extentData = $_REQUEST["extentData"];
$layers = $_REQUEST["layers"];


/* pings server to check for status */
function ping($url) {
    $pingResult = exec("ping -c 1 $url", $outcome, $status);
    if (0 == $status) {
        return("alive");
    } 
    else 
    {
        return("dead");
    }
}

/* fetches subset tif data from ulysses */
function curlPostGeoServer($layer, $extentData) {
    
    // Setup our GET url for GeoServer
    // Modify this url for specific data server ***
    $url = 'http://ulysses.agr.gc.ca:8080/geoserver/ows?service=WCS&version=2.0.1&request=GetCoverage&CoverageId=Canada__' . $layer . '&subset=Long('. $extentData[0] . ',' . $extentData[2] . ')&subset=Lat(' . $extentData[1] . ',' . $extentData[3] . ')';
    
    // setup the curl request and headers
    $ch = curl_init($url); 
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml')); curl_setopt($ch, CURLOPT_HEADER, 0); 
    curl_setopt($ch, CURLOPT_GET, 1); 
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0); 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
    // execute the request
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
        $errMsg = "\n\n" . date("Y-m-d H:i:s ") . 
                  " ERROR" . $_SERVER["REQUEST_TIME "] . "\n\t " . __FILE__ . 
                  "\n\t Request XML error: POST request returned without a valid GeoTIFF.\n\t" . 
                  "Refer to XML for info:\n\t XML Response:\n\t url: {$url}\n\t xml:\n\t {$ch_result} ";
        
        file_put_contents("error/errorlog.txt ", $errMsg, FILE_APPEND); 
        return("fail : " . $errMsg); 
        
    } 
    else 
    { 
        // Apply time-stamp to file and save 
        $fileName = "temp/" . $layer . "_" . date("This") . ".tif";         
        file_put_contents($fileName, $ch_result); 
        return("../php/" . $fileName); 
    } 
}


/* creates a compressed zip file */
function createZip($files = array(), $destination = '', $metadata = '', $overwrite = false) {
    
    // if zip already exists and overwrite is false, return false
    if (file_exists($destination) && !overwrite) { return false; }
    //vars
    $valid_files = array();
    // if files were passed in...
    if (is_array($files)) {
        // cycle through each file
        foreach ($files as $file) {
            // make sure the file exists
            if (file_exists($file)) {
                $valid_files[] = $file;
            }
        }
    }
    
    // if files check out...
    if (count($valid_files)) {
        // create archive
        $zip = new ZipArchive();
        if ($zip->open($destination, $overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true) {
            return false;
        }
        // add the files
        foreach($valid_files as $file) {            
            $newfile = substr($file, 12);            
            $zip->addFile($file, $newfile);
        }
        if (file_exists($metadata)) {
            $metasplit = substr($metadata, 5);
            $zip->addFile($metadata, $metasplit);
        }
        // close zip - finished
        $zip->close();
        // check file
        return file_exists($destination);
    }
    else
    {
        return false;
    }
}


function dataFetch($url, $extent, $extentData, $zipname, $metaDoc, $msg, $layers) {
    // var
    $filepathArray = array();
    // check to see if server's alive
    if (ping($url) == "alive") {       
        // open metadata document
        file_put_contents($metaDoc, $msg);   

        // loop through passed in layer array
        foreach ($layers as $layer) {

            // fetch data from geoserver, catch filename response
            $filepath = curlPostGeoServer($layer, $extentData);

            // check for geoserver processing success, delete metedata doc if failed
            if (strpos($filepath, "fail") !== false || file_exists($filepath) == false) {
                unlink($metaDoc);
                return("fail : geoserver process error, check error log");
            } 
            else 
            {
                // execute metadata script in python, catch result
                $result = shell_exec("python3 ../py/createMetaData.py $extent $filepath"); 

                // check for python run success, delete metadata doc if failed 
                if (strpos($result, "fail") !== false) {
                    unlink($metaDoc);
                    return($result);
                }
                else
                {
                    $filepathArray[] = $filepath;
                }
            }
        }

        // do that zip shit here then send success msg to html    
        $result = createZip($filepathArray, $zipname, $metaDoc);

        if ($result == true) {
            // clean up the folder after zipping..
            foreach($filepathArray as $file) {
                $file = substr($file, 7);
                $xml = $file . ".aux.xml";
                unlink($file);
                unlink($xml);
            }
            unlink($metaDoc);
            return("success");
        }
        else
        {
            return("fail : zip archive unsuccessful");
        }
    } 
    else 
    {
        // send server down error
        return("fail : " . $url . " is down");
    }
}


// setup some variables
$extent = implode(",", $extentData);
$zipname = "temp/soildata_" . date("THis") . ".zip";
$metaDoc = "temp/metadata.txt";
$url = "ulysses.agr.gc.ca";
$msg = "METADATA DOCUMENT\n" . 
       "Date: " . date("Y-m-d H:i:s") . 
       "\n Server: " . $url . 
       "\n Request_Time: " . $_SERVER["REQUEST_TIME"] . 
       "\n Data provided by Agriculture and Agri-Food Canada \n\n\n";


// execute the script, catch the response, send it to the client
$result = dataFetch($url, $extent, $extentData, $zipname, $metaDoc, $msg, $layers);
echo json_encode(array($result, $zipname));





?>