/* 

 This code uses GeoServer's REST interface to collect the
 available layer-groups, then parses that information for 
 specific layers, fetching layer descriptions with another 
 REST call. This code relies heavily on the correct formatting
 of data loaded onto GeoServer.

 Created for inclusion with the Data Portal prototype. 
 Author: Andrew Roberts 
 Modified: 2017-04-27

*/


// REST URL of data server 
var $url2 = "http://ulysses.agr.gc.ca:8080/geoserver/rest/workspaces/Canada/coveragestores/"
var $url = "http://ulysses.agr.gc.ca:8080/geoserver/rest/workspaces/Canada/layergroups.json"

// Populates list of available data layers from Ulysses using REST api
// First, fetch a list of available layergroups
$.ajax({
    url: $url,
    type: "GET",
})
    .done( function(data){
        var $lGLength = data.layerGroups.layerGroup.length;
        var $lGArray = [];            

        // Write layergroups to sorted array lGArray 
        for(i = 0; i < $lGLength; i++){
            $lGArray.push(data.layerGroups.layerGroup[i])
            $lGArray.sort();
        }

        // Loop through lGArray and fetch data on each entry
        var $lGALength = $lGArray.length;
        for(x = 0; x < $lGALength; x ++) {
            // 
            $.ajax({
                url: $lGArray[x].href,
                type: "GET",
                async: false,
            })
                .done( function(data) {
                    var $lGName = data.layerGroup.name;
                    var $lGTxt = data.layerGroup.abstractTxt;
                    var $pubLength = data.layerGroup.publishables.published.length;

                    // Create an accordion section for each layergroup
                    $('#layer-group-acc').append('<div id="' + $lGName + '" class="title">' + 
                                                    '<i class="dropdown icon"></i>' +
                                                        $lGName + '<br/>' +
                                                    '<span class="span-attr">' + $lGTxt + '</span>' +
                                                 '</div>' + 
                                                 '<div class="content">' +
                                                    '<select id="dropdown-' + $lGName + '" ' +
                                                    ' name="attributes" ' +
                                                    ' multiple="" ' +
                                                    ' class="layer-dropdown ui fluid dropdown multiple selection">' +
                                                        '<option value="">soil attribute</option>' +
                                                    '</select>' +
                                                 '</div>');
                    for(y = 0; y < $pubLength; y++){
                        // Get all the layers for each layergroup, write to dropdown 
                        $.ajax({
                            url: $url2 + data.layerGroup.publishables.published[y].name + ".json",
                            type: "GET",
                            async: false,
                        })
                            .done( function(data) {
                                $('#dropdown-' + $lGName).append('<option value="' + 
                                                                 data.coverageStore.name + '">' + 
                                                                 data.coverageStore.description + 
                                                                 '</option>');
                            })
                            // Handle failure of loser code
                            .fail( function(xhr, status) {
                            // handle this shit
                            });
                    }
                })
                // Handle anotehr server error
                .fail( function (xhr, status){
                // Do something with error response    
                });
        }

        // Handle a tallied list of selected files
        $('.ui.dropdown.multiple').dropdown() 
                                  .change( function() {                        
                    var count,
                        $list = $('.layer-dropdown').dropdown('get value'),
                        $lyrList = $('.selected-layers-list');

                    // Drop into two dimentional arrays if present
                    $lyrList.empty().html( function() {
                        $.each($list, function(index, value){
                            if ($.isArray(this)) {
                                $.each(this, function(index, value){
                                    $lyrList.append('<div class="item">' + 
                                            '<i class="check circle icon"></i>' + 
                                            '<div class="content">' + value + 
                                            '</div></div>');
                                })
                            } else if (value != "") {
                                 $lyrList.append('<div class="item">' + 
                                            '<i class="check circle icon"></i>' + 
                                            '<div class="content">' + value + 
                                            '</div></div>');  
                            }   
                        })
                    });
                    count = getSelectedLayers().length;
                    if (count == 1)
                        $('.download-draw .content').html(count + ' layer');
                    else    
                        $('.download-draw .content').html(count + ' layers');
                });
        // invert the intro modal
        $(".page-intro").modal('show');
    })        
    // Handle server response failure
    .fail( function(xhr, status){
        // Do something with error response
    });