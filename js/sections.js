
function selectMenu(){

	 var statesName = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

	 var statesSelect = d3.select('#state')
	 	.append('select')
	 	.attr('id','state-select')
	 	.attr('class','selectMenu')
	 	.on('change', stateChange);

	var stateOptions = statesSelect.selectAll('option')
		.data(statesName)
		.enter()
		.append('option')
		.text(function(d) {return d;});

	function stateChange(){
		var selectState = d3.select('#state-select').property('value');
		return selectState;
	};

	var commuteMode = ['-- Select Vehicle Type --',
		               'Sedan/Hardtop/2-Door Coupe',
	                   'Utility',
					   'Van',
					   'Light Vehicle',
					   'Other',
					   'Truck'];

	var commuteSelect = d3.select('#commute')
	 	.append('select')
	 	.attr('id','commute-select')
	 	.attr('class','selectMenu');
	 	//.on('change', commuteChange);

	var commuteOptions = commuteSelect.selectAll('option')
		.data(commuteMode)
		.enter()
		.append('option')
		.text(function(d) { return d; });

	d3.select("#weatherVar")
	  .on("change", highlightLine);

};

var scrollVis = function(){
	  // constants to define the size
	  // and margins of the vis area.
	  var width = 600;
	  var height = 520;
	  var margin = {top:0, left:20, bottom:40, right:10};

	  selectMenu();
};


scrollVis();










































