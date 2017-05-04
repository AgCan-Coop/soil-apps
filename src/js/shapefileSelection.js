/* 

 This code adds OpenLayers interactions to any uploaded
 shapefiles. The selection interaction is written on a
 seperate ol.Layer than the users drawings.

 Created for inclusion with the Data Portal prototype. 
 Author: Andrew Roberts 
 Modified: 2017-04-27

*/


// Create select interaction for shapefile uploads
var shapefileSelect = new ol.interaction.Select({
    layers: [shapefileLayer],
}); 

// Add it to the map
var shapefileSelected = shapefileSelect.getFeatures();        
map.addInteraction(shapefileSelect);

// Create dragbox interaction for shapefile uploads
var dragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.platformModifierKeyOnly,
    layers: [shapefileLayer],
});

// Add it to the map
map.addInteraction(dragBox);

// Fetch all selected features and write to an array
dragBox.on('boxend', function() {
    var extent = dragBox.getGeometry().getExtent();
    shapefileSource.forEachFeatureIntersectingExtent(extent, function(feature) {
        shapefileSelected.push(feature);
    });
    $("#shape-data-ready").slideUp(500);
});

dragBox.on('boxstart', function() {
    shapefileSelected.clear();
})       


// Get extent shapefile upload, or for selected features from the shapefile
function getShapefileExtent() {
    // Check if features are loaded
    if (shapefileLayer.getSource().getFeatures() < 1) {
        return("none");
    }
    else 
    {
        // fetch array of selected features
        var newExtent,
            extent,
            shapearray = shapefileSelect.getFeatures().getArray();
        // if array isn't empty, get extent of those features
        if ( shapearray.length > 0) { 
            // create empty extent to loop into
            extent = ol.extent.createEmpty();   
            // in a loop on the feature array, extend the extent
            shapearray.forEach( function(feature) {
                ol.extent.extend(extent, feature.getGeometry().getExtent());            
            });           
        }
        // if array is empty, get the extent of the shapefile
        else
        {
            extent = shapefileLayer.getSource().getExtent();       
        }
        newExtent = ol.proj.transformExtent([extent[0], 
                                             extent[1], 
                                             extent[2], 
                                             extent[3]], 
                                             'EPSG:3857', 'EPSG:4326');
        return(newExtent); 
    }
};
