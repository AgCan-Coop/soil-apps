/* 

 This code sends a user selected AOI to a php script and 
 returns a download button to the location of the users
 zipped data.

 Created for inclusion with the Data Portal prototype. 
 Author: Andrew Roberts 
 Modified: 2017-04-27

*/


// Fetch list of currently selected layers for download
function getSelectedLayers() {     
    
    var selectedLayers = [],
        featureExtent; 
    
    $('.selected-layers-list .content').each(function(){
        selectedLayers.push(this.innerText);
    })
    return(selectedLayers);
};


// Pass data to php script and return process geotiffs
function getGeoTiffs(e) {    
    
    var layers = getSelectedLayers(),
        extentData, 
        id; 
    
    // get id from the element that the click event orignated from,
    // and handle if it came from jQuery modal, or js click
    id = (e instanceof jQuery) ? $('.warning.sign.icon').attr('id') : e.currentTarget.id;    
    
    // check if the download click originated from the drawing panel
    if (id == "download-draw" || id == "modal-draw") {        
        // handle the extent from draw features or user input bbox
        if (selectType == "Point") {
            $(".draw-point-warning").removeClass('hidden');    
            return;
        }
        // handle the warning message
        if (!$(".draw-point-warning").hasClass('hidden'))            
            $(".draw-point-warning").addClass('hidden');
        
        // if all checks out, assign drawing panel extent to variable for post data
        if (drawCoords !== null)            
            extentData = drawCoords;        
        else             
            extentData = bboxCoords;         
    } 
    else 
    {
        // handle extent from shapefile upload
        var shapeExtent = getShapefileExtent();
        // check that we have features on the map
        if (shapeExtent == "none") {
            $(".shape-warning").removeClass('hidden');
            return;
        }
        // check that the feature isn't a single point
        else if (shapeExtent[0] == shapeExtent[2] && shapeExtent[1] == shapeExtent[3]) 
        {
            $(".point-warning").removeClass('hidden');
            console.log(shapeExtent);
            return;
        }
        // if all looks good, assign shapefile extent to variable for post data
        else
        {      
            $(".shape-warning, .point-warning").addClass('hidden');             
            extentData = shapeExtent;        
        }        
    }
    
    // made it past conditions, launch the loader
    $(".data-loader").addClass("active");

    // *** Handle point download right here! In the future
    
    $.post("../lib/php/dataFetch.php", 
    {
        selectType : selectType,
        extentData : extentData,
        layers     : layers
    })
    .done(function(data, status) {
        data = jQuery.parseJSON(data);
        if (data[0] !== "fail") {
            // direct the download button to draw or shapefile panel
            if (id == "download-draw" || id == "modal-draw") {
                // do good stuff
                $(".data-loader").removeClass("active");
                $("#data-link").attr("href", "../lib/php/" + data[1]);
                $("#data-ready").slideDown(500);
            }
            else
            {
                $(".data-loader").removeClass("active");
                $("#shape-data-link").attr("href", "../lib/php/" + data[1]);
                $("#shape-data-ready").slideDown(500);
            }
        } 
        else 
        {
            // do bad stuff
        }
        console.log("Response:  ", data, status)
    })
    
    
};


// Initiate download on click, throw warning if layer count is too high, and
// add different id's to the modal in order to differentiate origin of click event
$('.download-draw, .download-shapefile').click(function(e) {
    var lyrCount = getSelectedLayers().length;
    console.log(e)
    
    if (lyrCount == 0 || lyrCount > 6) { 
        if (lyrCount > 6) {
            if (e.currentTarget.id == "download-draw"){             
                $('.count-many .icon.header').html('<i id="modal-draw" class="warning sign icon"></i>' + lyrCount + ' Layers Selected');            
            } 
            else 
            {            
                $('.count-many .icon.header').html('<i id="modal-shapefile" class="warning sign icon"></i>' + lyrCount + ' Layers Selected');
            }        
            $('.count-many').modal('show');
        }
        else
        {
            $('.count-zero').modal('show');
        }        
    }
    else 
        getGeoTiffs(e);    
});

// close the single point download warning
$(".draw-point-warning").click(function(){    
    $(".draw-point-warning").addClass('hidden');
});
