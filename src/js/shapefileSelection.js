/****************************  Add shapefile selection interaction ********************/


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
});

dragBox.on('boxstart', function() {
    shapefileSelected.clear();
})       

// A series of select console log checks
//        select.on('select', function(e) {
//            console.log("1" + e.target.getFeatures());
//            console.log(e.target.getFeatures().a);
//            console.log(e.target.getFeatures());
//            console.log(e.selected[0]);
//            console.log(e.selected[0].T);
//            console.log(e.selected[0].T.geometry.A);
//            document.getElementById('features').innerHTML = '&nbsp;' +
//                e.target.getFeatures().getLength() +
//                ' selected features (last operation selected ' + e.selected.length +
//                ' and deselected ' + e.deselected.length + ' features)';            
//        });
