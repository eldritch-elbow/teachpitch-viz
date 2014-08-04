/* Define a few key variables */
var geojson = null;

var needs = {}
var countData = {}
var count_threshold = 5;

var info = L.control();
var filter_panel = L.control({position: 'bottomleft'});


/* DATA: Define active learning needs (from first country) */

console.log(Object.keys(needs_by_country[0]));
$.each( Object.keys(needs_by_country[0]), function( index, value ) {
  needs[value] = false;
});

/* UI: Create learning needs filter buttons */
$.each(Object.keys(needs_categories), function( index, value ) {
	if (value != "Country") {
  		$('#needs_filter').append('<input type="checkbox" id="'+value+'" name="need" >'+value+'<br>');
  	}
});

$('#needs_filter').append('<button id="clear" type="button">Clear</button><br>');
$('#needs_filter').append('<button id="all" type="button">Select All</button><br>');


/* DATA: Calculate learning need counts */

function calc_counts() {  

	$.each(needs_by_country, function(country_idx, country) {
		running_total = 0;		
		$.each(country, function( key, value ) {
			if ( (key != "Country") && (needs[key] == true) ) {
				running_total += value
			}
		});

		countData[country['Country']] = running_total
	});
	
	console.log(countData)
}

/* Add handlers for filter clicks */
$( "input" ).click(function() {
	checked = $( this ).is(':checked');
	category = $( this ).attr('id');

	console.log( checked );
	console.log( category );
	console.log( needs_categories[category] )	

	$.each( needs_categories[category], function( key, value ) {
		needs[ value ] = checked;
	});

	refresh();
});


function set_all_inputs(status) {

	$("input").prop("checked", status);

	$.each(needs, function( key, val ) {
		needs[key] = status;
	});

	refresh();

}

$( "#all" ).click(function() {
	set_all_inputs(true)

});

$( "#clear" ).click(function() {
	set_all_inputs(false)
});


/* Define feature styling and highlight behaviour */

function getColor(d, max_linear_val) {
	inc = max_linear_val / 6
	return d > (inc*6) ? '#b10026' : d > (inc*5) ? '#e31a1c' : d > (inc*4) ? '#fc4e2a' : d > (inc*3) ? '#fd8d3c' : d > (inc*2) ? '#feb24c' : d > (inc*1) ? '#fed976' : '#ffffb2';
}

function style(feature) {
	return {
		fillColor: getColor(countData[feature.id], count_threshold),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

function highlightFeature(e) {
	var layer = e.target;
	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	info.update(layer.feature);
}

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}



/* Create the map */

var map = L.map('map').setView([37.8, 0], 2);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; ' + '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
}).addTo(map);


info.onAdd = function(map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
};

info.update = function(feature) {

	this._div.innerHTML = 
		'<h4>Teacher Needs (by country)</h4>' + 
		(feature ? 
			'<b>' + feature.properties.name + '</b>'+			
			'<br/>' + 
			(countData[feature.id] || 0) + ' teachers'


		: 'Hover over a region');
};

info.addTo(map);




/* Create filter panel */

filter_panel.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'control filter'); 
    this.update();
    return this._div;
};


filter_panel.update = function (props) {
    this._div.innerHTML = 
		'<div id="threshold_control">'+
	        '<div id="threshold_display"></div><br>'+
	        '<div id="threshold_slider"></div>'+
		'</div>';
};

filter_panel.addTo(map);


/* Create threshold slider */
function create_slider() {

	threshold_slider = $("#threshold_slider");
	threshold_display = $("#threshold_display");

	max_count = 0;
	$.each( countData , function( index, value ) {
		max_count =Math.max(max_count, value)
	});

	threshold_slider.slider({
	    range: false,
	    min:   1,
	    max:   max_count,
	    value: count_threshold,
	    step:  1,
	    slide: slide_threshold
	});

}

function slide_threshold(event, ui) {
	console.log(ui.value);

	count_threshold = ui.value;
	update_threshold_display()

	refresh();
}

function update_threshold_display( ) {
	threshold_display = $("#threshold_display");
	threshold_display.text( 'Teacher count threshold: ' + count_threshold);
}



/* Modify map scrolling behaviour to accommodate controls */ 
$('.control').mouseenter(function() {
  map.dragging.disable();
  map.doubleClickZoom.disable();
});

$('.control').mouseleave(function() {
  map.dragging.enable();
  map.doubleClickZoom.enable();
});



function refresh() {

	calc_counts()
	create_slider();
	update_threshold_display();

	if (geojson) {
		map.removeLayer(geojson);
	}

	geojson = L.geoJson(regionData, {
		style: style,
		onEachFeature: onEachFeature
	})
	.addTo(map);

}

refresh();









