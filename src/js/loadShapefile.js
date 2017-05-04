/* 

 This code utilizes the Shp2Geojson.js library to allow
 shapefile uploads directly into openlayers. It does this
 by reading the uploaded zip and converting the data into
 geojson, which is then loaded onto a shapefile layer on 
 the map.

 Created for inclusion with the Data Portal prototype. 
 Author: Andrew Roberts 
 Modified: 2017-04-27

*/ 

    
// New style for the shapefile uploads
var shapeStyle = new ol.style.Style ({
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: 'rgba(230,249,255,.2)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0,154,204,0.5)'
        })
    }),
    fill: new ol.style.Fill({
        color: 'rgba(230,249,255,.2)'
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(0,154,204,0.5)'
    })
});


// Define new source for new layer
var shapefileSource = new ol.source.Vector({
    wrapX: false 
});

// Define new layer for shapefile upload
var shapefileLayer = new ol.layer.Vector({
    name: 'shapefileLayer',
    source: shapefileSource,
    style: shapeStyle
})
map.addLayer(shapefileLayer);


// Add users shapefile upload
var file;
function loadShpZip() {            
    shapefileSource.clear();

    var encoding = ($('#options-encoding').val() == '') ? 'UTF-8' : $('#options-encoding').val(),
        epsg = ($('#options-epsg').val() == '') ? '4326' : $('#options-epsg').val();

    loadshp({
        url: file,
        encoding: encoding,
        EPSG: epsg
    }, function(data, error){       
        var feature = new ol.format.GeoJSON().readFeatures(data, {
            featureProjection: 'EPSG:3857'
        });
        shapefileLayer.getSource().addFeatures(feature);
        shapefileLayer.set('name', file.name);

        var extent = shapefileLayer.getSource().getExtent();
        map.getView().fit(extent, map.getSize());
        $('#download-shapefile').removeClass('disabled');
    });          
};         


// Show options and enable preview when user adds zipped file
$("#file").change(function(evt) {
    $("#shape-data-ready").slideUp(500);
    file = evt.target.files[0];
    var html = '<div class="field">' +                         
                 '<div id="dataName" class="ui label">' +
                   '<i class="checkmark icon"></i>' + file.name +
                   '<div id="dataSize" class="detail">' + file.size + ' kb' + 
               '</div></div></div>';
    if (file.size > 0) {
        $('#dataInfo').addClass('field').html(html);                            
        $('#options').slideDown(500);
        $('.preview-shapefile').removeClass('disabled');
    }            
});


// Clear all map features and load users shapefile 
$( '.preview-shapefile' ).click(function() {
    $("#shape-data-ready").slideUp(500);
    var dDDown = $('.drawing-dropdown');
    if (dDDown.dropdown('get value') == "None") {
        selectType = dDDown.dropdown('get value');
        map.removeInteraction(draw);
        addInteraction();
    } else {
        dDDown.dropdown('set selected', "None");
    }
    loadShpZip();
});

// close the 'No Features' warning sign on click
$(".shape-warning, .point-warning").click(function() {
    $(".shape-warning, .point-warning").addClass('hidden');
});
