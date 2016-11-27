
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
		console.log(selectState);
	};

	/*

	need to change from other member

	*/
	var commuteMode = ['car','motor','truck'];

	var commuteSelect = d3.select('#commute')
	 	.append('select')
	 	.attr('id','commute-select')
	 	.attr('class','selectMenu')
	 	.on('change', commuteChange);

	var commuteOptions = commuteSelect.selectAll('option')
		.data(commuteMode)
		.enter()
		.append('option')
		.text(function(d) {return d;});

	function commuteChange(){
		var commuteState = d3.select('#commute-select').property('value');
		console.log(commuteState);
	};

	/*

	need to change from other member

	*/
	var weather = ['rainy','snow','sunny'];

	var weatherSelect = d3.select('#weather')
	 	.append('select')
	 	.attr('id','weather-select')
	 	.attr('class','selectMenu')
	 	.on('change', weatherChange);

	var weatherOptions = weatherSelect.selectAll('option')
		.data(weather)
		.enter()
		.append('option')
		.text(function(d) {return d;});

	function weatherChange(){
		var weatherState = d3.select('#weather-select').property('value');
		console.log(weatherState);
	};
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










































