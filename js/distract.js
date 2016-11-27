dataset = new Array();
  find_state=10;
  var map1=new Array(); 
  var map2=new Array(); 
  var map3=new Array(); 
  var map4=new Array();  
for(var i=0;i<57;i++){ 
map1[i]=new Array(); 
map2[i]=new Array();
map3[i]=new Array();
map4[i]=new Array();
for(var j=0;j<8;j++){ 
map1[i][j]=null;
map2[i][j]=null;
map3[i][j]=null;
map4[i][j]=null;
}
}


   console.log(" ");
    d3.csv("data/factor.csv",function(error,csvdata){  
      
        if(error){  
            console.log(error);  
        }  
        
		for( var i=1; i<csvdata.length; i++ ){  
    var state = parseInt(csvdata[i].STATE);  
    var fatals = parseInt(csvdata[i].FATALS);  
    var day_week = parseInt(csvdata[i].DAY_WEEK); 
    var mdrdstrd = parseInt(csvdata[i].MDRDSTRD);
    var speedrel = parseInt(csvdata[i].SPEEDREL);


    // 
    if(mdrdstrd==0 && speedrel ==0)          // no distract and no speedind
        map1[state][day_week]+= fatals;  
    if(mdrdstrd!=0 && speedrel ==0)          // no speeding but has distract   
        map2[state][day_week]+= fatals;    
    if(mdrdstrd==0 && speedrel !=0)              //no distract but has speeding 
        map3[state][day_week]+= fatals;  
    if(mdrdstrd!=0 && speedrel !=0)              //has speeding and distract
        map4[state][day_week]+= fatals;                           
				
          
    }

       for(var i=1;i<8;i++){ 
dataset[i]=map1[find_state][i];
    }

showclass();
	}); 



    function change_condition(){
        d3.select("div")
		.remove("svg");
       var com = document.createElement("div"); 
       var temp=document.getElementsByTagName("body");
       temp[0].appendChild(com);
if(document.getElementById("checkbox1").checked==true && document.getElementById("checkbox2").checked==true){
    console.log("checkbox1,2 is checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map4[find_state][i];
    }
showclass();
    
}
if(document.getElementById("checkbox1").checked==true && document.getElementById("checkbox2").checked==false){
    console.log("checkbox1 is checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map3[find_state][i];
    }
showclass();
    
}
if(document.getElementById("checkbox1").checked==false && document.getElementById("checkbox2").checked==true){
    console.log("checkbox2 is checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map2[find_state][i];
    }
showclass();
    
}
if(document.getElementById("checkbox1").checked==false && document.getElementById("checkbox2").checked==false){
    console.log("checkbox1,2 is not checked");
        for(var i=1;i<8;i++){ 
dataset[i]=map1[find_state][i];
    }
showclass();
    
}

    }



function showclass(){

	var width = 400;
	var height = 400;

	//add svg
	 svg = d3.select("div")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	var padding = {left:30, right:30, top:20, bottom:20};


	var xScale = d3.scale.ordinal()
		.domain(d3.range(dataset.length))
		.rangeRoundBands([0, width - padding.left - padding.right]);


	var yScale = d3.scale.linear()
		.domain([0,d3.max(dataset)])
		.range([height - padding.top - padding.bottom, 0]);

	//x-axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");
		
	//y-axis
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");

	
	var rectPadding = 4;

	//add rect
	var rects = svg.selectAll(".MyRect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("class","MyRect")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.attr("x", function(d,i){
			return xScale(i) + rectPadding/2;
		} )
		.attr("y",function(d){
			return yScale(d);
		})
		.attr("width", xScale.rangeBand() - rectPadding )
		.attr("height", function(d){
			return height - padding.top - padding.bottom - yScale(d);
		});

	//add text 
	var texts = svg.selectAll(".MyText")
		.data(dataset)
		.enter()
		.append("text")
		.attr("class","MyText")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.attr("x", function(d,i){
			return xScale(i) + rectPadding/2;
		} )
		.attr("y",function(d){
			return yScale(d);
		})
		.attr("dx",function(){
			return (xScale.rangeBand() - rectPadding)/2;
		})
		.attr("dy",function(d){
			return 20;
		})
		.text(function(d){
			return d;
		});

	//add x-axis
	svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + padding.left + "," + (height - padding.bottom) + ")")
		.call(xAxis); 
		
	//add y-axis
	svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.call(yAxis);


}