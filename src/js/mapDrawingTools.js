/* 

 This code provides the drawing functionality for the
 web map. All documentation can be found in the 
 OpenLayers API.

 Created for inclusion with the Data Portal prototype. 
 Author: Andrew Roberts 
 Modified: 2017-04-27

*/


// Setup some globals and fetch the selected draw tool
var draw, lastFeature, drawCoords = null,
    selectType = $('.drawing-dropdown').dropdown('get value');


// Create main interaction function for adding and removing
// drawings on the map page
//
function addInteraction() {
    var value = selectType;
    // Setup some geometry conditionals
    if(value !== 'None') {
        var geometryFunction, maxPoints;
        if(value === 'Square') {
            value = 'Circle';
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
        } else if (value === 'Box') {
            value = 'LineString';
            maxPoints = 2;
            geometryFunction = function(coordinates, geometry) {
                if (!geometry) {
                    geometry = new ol.geom.Polygon(null);
                }
                var start = coordinates[0];
                var end = coordinates[1];
                geometry.setCoordinates([
                    [start, [start[0], end[1]], 
                     end, [end[0], start[1]], start]
                ]);
                return geometry;
            };
        }

        // Create the draw interaction with defined geometry function
        draw = new ol.interaction.Draw({
            source: source,
            type: (value),
            geometryFunction: geometryFunction,
            maxPoints: maxPoints
        });

        // Handle drawing feature removal
        var removeLastFeature = function() {
            if (lastFeature) 
                source.removeFeature(lastFeature);
        };

        // Remove feature when begining all drawings except Points 
        draw.on('drawstart', function(e) {
            shapefileSource.clear();
            if (selectType !== 'Point') {
                source.clear();
            }
        });

        // Remove feature when ending drawing IF it's a Point and IF
        // there's a feature to remove
        draw.on('drawend', function (e) {
            if (selectType == 'Point') {
                if (source.getFeatures().length > 0)
                    removeLastFeature();                    
            }
            lastFeature = e.feature;
            displayDrawingExtent();
            clearBBoxErrors();
            $("#data-ready").slideUp(500);
        });

        // Finally, add the draw interaction to the map
        map.addInteraction(draw); 
        
    } else {
        source.clear();
        drawCoords = null;
        lastFeature = undefined;
        $('.coord-box').html(" - - &emsp; - -");
//        $('.bbox').val($(this).attr('placeholder'));
    }
};
// Add it to the map on page load
addInteraction(); 


// Handle drawing tool change
//
$('.drawing-dropdown').change( function() { 
    selectType = $('.drawing-dropdown').dropdown('get value');
    map.removeInteraction(draw);
    addInteraction();
});


// Disable the download button when None is selected from the dropdown.
// We add the onclick to distinguish it from other dropdown changes events
//
$('#draw-none').click(function() {
    if (!$('.download-draw').hasClass('disabled'))
        $('.download-draw').addClass('disabled');
})


// Clear any warning boxes or error classes from BBox form
//
function clearBBoxErrors() {
    $('.bbox').val($(this).attr('placeholder'));
    $('.download-draw').removeClass('disabled');
    $('.bbox').closest('.field').removeClass('error');
    $('.bbox-form').removeClass('warning');
}


// Fetch the extent of any drawing made on the map, reproject it
// to WGS84, and display the coords for the user
//
function displayDrawingExtent() {  
    if (lastFeature !== undefined) { 
        var html,             
            extent = lastFeature.getGeometry().getExtent();
        
        drawCoords = ol.proj.transformExtent([extent[0], 
                                              extent[1], 
                                              extent[2], 
                                              extent[3]], 
                                             'EPSG:3857', 'EPSG:4326');
        
        if (selectType == "Point") {
            html = '<div class="ui label">' +
                    '<i class="checkmark icon"></i> Extent in WGS84: ' +
                    '<div class="coord-box detail">' + 
                        drawCoords[0].toFixed(2) + ', ' + 
                        drawCoords[1].toFixed(2) +
                   '</div></div>';
            drawCoords.splice(0,2);
        } else {
            html = '<div class="ui label">' +
                    '<i class="checkmark icon"></i> Extent in WGS84: ' +
                    '<div class="coord-box detail">' + 
                        drawCoords[0].toFixed(2) + ', ' + 
                        drawCoords[1].toFixed(2) + '&emsp;' +
                        drawCoords[2].toFixed(2) + ', ' + 
                        drawCoords[3].toFixed(2) +
                   '</div></div>';
        }
        
        $('#feature-extent').html(html).slideDown(500);        
    }
};