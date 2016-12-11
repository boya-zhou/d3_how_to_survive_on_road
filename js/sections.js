
function selectMenu(){

    var states = ['-- Select State --','Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
                  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
                  'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
                  'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee',
                  'Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

	var statesSelect = d3.select('#state')
	 	.append('select')
	 	.attr('id','state-select')
	 	.attr('class','selectMenu');
	 	// .on('change', stateChange);

	var stateOptions = statesSelect.selectAll('option')
		.data(states)
		.enter()
		.append('option')
		.attr('value',function(d){return d;})
		.text(function(d) {return d;});

	// function stateChange(){
	// 	var selectState = d3.select('#state-select').property('value');
	// 	return selectState;
	// };
	$("option[value='-- Select State --']")
	  .attr("disabled", "disabled")
	  .siblings().removeAttr("disabled");

	var commuteMode = ['-- Select Vehicle Type --',
		               'Sedan/Hardtop/2-Door Coupe',
	                   'Utility',
					   'Van',
					   'Light Vehicle',
					   'Other',
					   'Truck',
					   'Back'];

	var commuteSelect = d3.select('#commute')
	 	.append('select')
	 	.attr('id','commute-select')
	 	.attr('class','selectMenu');
	 	//.on('change', commuteChange);

	var commuteOptions = commuteSelect.selectAll('option')
		.data(commuteMode)
		.enter()
		.append('option')
		.attr('value',function(d, i){return i;})
		.text(function(d) { return d; });
	
	$("option[value='0']")
	  .attr("disabled", "disabled");

	$("option[value='7']")
	  .attr("disabled", "disabled");

	d3.select("#weatherVar")
	  .on("change", highlightLine);

};
	selectMenu();










































