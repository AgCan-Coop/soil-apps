/* 

 This code receives and verifies user inputs for the
 bounding box drawing option. If all data is correct
 and no errors are raise, the code will add a polygon
 the map representing this bounding box.

 Created for inclusion with the Data Portal prototype. 
 Author: Andrew Roberts 
 Modified: 2017-04-27

*/ 

        
// Set this out for later use
var bboxCoords;
        
// Validate user inputs, display any warnings, then on success
// add a polygon from the Bounding Box user input
//
function addUsersCoords() {
    source.clear();
    var minX, minY, maxX, maxY, epsg, error, coords;

    error= 0;
    coords = [ 
        [minX, '#minX'], 
        [minY, '#minY'], 
        [maxX, '#maxX'], 
        [maxY, '#maxY'], 
        [epsg, '#epsg'] 
    ];

    $.each(coords, function(){
        this[0] = parseFloat($(this[1]).val());
    })            

    for (i = 0; i < coords.length; i++){            
        if (!$.isNumeric(coords[i][0])){
            $(coords[i][1]).closest('.field').addClass('error');
            if (!$('.download-draw').hasClass('disabled'))
                $('.download-draw').addClass('disabled');           
            error += 1;
        } else {
            $(coords[i][1]).closest('.field').removeClass('error');
            $('.download-draw').removeClass('disabled');
        }
    }

    if (error == 0) {
        
        // Create a new feature with the users bbox input then
        // try and add it to the map, or catch the error
        var polygon = new ol.Feature({
            geometry: new ol.geom.Polygon([
                [
                    //  Example coords
//                        [-61.933352224,45.886673304000006],
//                        [-61.933352224,47.053339784],
//                        [-64.450018488,47.053339784],
//                        [-64.450018488,45.886673304000006],
//                        [-61.933352224,45.886673304000006]
                    [coords[2][0], coords[1][0]],
                    [coords[2][0], coords[3][0]],
                    [coords[0][0], coords[3][0]],
                    [coords[0][0], coords[1][0]],
                    [coords[2][0], coords[1][0]]

                ]
            ])
        });

        try {
            polygon.getGeometry().transform('EPSG:' + coords[4][0], 'EPSG:3857');
            source.clear();

            shapefileSource.clear();

            vectorDraw.getSource().addFeature(polygon);
            var extent = vectorDraw.getSource().getExtent();
            map.getView().fit(extent, map.getSize());
            lastFeature = polygon;
            bboxCoords = coords;
            $('.bbox-form').removeClass('warning');
            $('.download-draw').removeClass('disabled');
        }
        catch(err) {
            $('.bbox-form').addClass('warning');
            if (!$('.download-draw').hasClass('disabled'))
                $('.download-draw').addClass('disabled');
        }               
    } 
};

// Add users feature with onlick
$('.preview-bbox').click( function(){
    $('.drawing-dropdown').dropdown('set selected', "None");
    addUsersCoords();
});


// close the warning on the bbox
$('.bbox-form .message .close').on('click', function() {
    $('.bbox-form').removeClass('warning');
});