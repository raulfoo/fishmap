var returnOutput
function click_production(dat){

  sortType = "region"
  prepareData(dat,sortType);
  
  function prepareData(dat,sortType){
    $("#chloroDetails").html("");
    $("#graphLegend").html("");
    $("#import_Export").fadeOut();
   
    datCapture = dat.filter(function(e) { return e.subset == "Capture" })
    datAq = dat.filter(function(e) { return e.subset == "Aquaculture" })
    
   
    returnOutput = categorySelect(datCapture,sortType)
    
    firstSelect = returnOutput["firstSelect"]
    secondSelect = returnOutput["secondSelect"]
    partners = returnOutput["partners"]
    uniqueFish = returnOutput["uniqueFish"]
    
    output = []
  
    
    partners.forEach(function(type){
      temp = datCapture.filter(function(cat) { return cat[firstSelect] == type}); //cat.partner
      if(temp){
        tempOut = []
        jsObj = {}
        jsObj["State"] = type
        uniqueFish.forEach(function(fish){
          x = temp.filter(function(y) { return y[secondSelect] == fish}); //y.description
       
          if(x.length>0){
           
            jsObj[fish] = x[0].value
            tempOut.push(jsObj)
            }else{
             jsObj[fish] = 0
             tempOut.push(jsObj)
            }
        });
        output.push(tempOut[0])
        
      }
    
    });
    
 
    
    /*outputCapture = createRanks(output)*/
    
    outputAq = []
    datAq.forEach(function(x){
    
      outputAq.push({species: x.description, value: x.value}) 
    
    });
    outputAq.reverse()
    
    graph(outputCapture,outputAq,sortType,dat,uniqueFish)
    
  }
  
  
  function graph(output,outputAq,sortType,rawData,uniqueFish){
    if(sortType == "region"){
      switchSort = "species"
      
      }else{
      
      switchSort = "region"
      }
    var margin = {top: 60, right: 20, bottom: 100, left: 90},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  
    var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
  
    var x1 = d3.scale.ordinal();
  
    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
  
    var y = d3.scale.linear()
      .range([height, 0]);
  
    var color = d3.scale.ordinal()
      .range(["#7F3B08", "#B35806", "#E08214", "#FDB863", "#FEE0B6", "#F7F7F7", "#D8DAEB", "#B2ABD2", "#8073AC", "#542788","#2D004B"]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));
    if(output.length > 0){
      var svg = d3.select("#chloroDetails").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
      data = output
      var ageNames = uniqueFish
  
      data.forEach(function(d) {
        var y0 = 0
        d.ages = ageNames.map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], column: d.State}; });
        d.total = d.ages[d.ages.length - 1].y1;
      });
      
    
      x.domain(data.map(function(d) { return d.State; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]);
      
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis).selectAll("text")  
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", function(d) {
                  return "rotate(-30)" 
                  });
    
    
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "translate(-40,0)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Tonnes");
    
      var state = svg.selectAll(".state")
          .data(data)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; })
         
  
    
      state.selectAll("rect")
          .data(function(d) { return d.ages; })
        .enter().append("rect")
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.y1); })
          .attr("height", function(d) { return y(d.y0) - y(d.y1); })
          .style("fill", function(d) { return color(d.name); })
          .on("click", function(d) {prepareData(dat,switchSort)})
          .on("mouseover", function(d,i) {mouseoverFunc(d,i,rawData,switchSort)})
          .on("mouseout", mout)
  
        svg.append("text")
          .attr("x", (width / 2))             
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")  
          .style("font-size", "16px") 
          .style("text-decoration", "underline")  
          .text(dat[0].region_name +": Top Capture Production Sources by " +sortType);
     
     
      var svg1 = d3.select("#graphLegend").append("svg")
        .attr("width", 200 + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
      legend = svg1.selectAll(".legend")
          .data(ageNames.slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
  
           legend.append("rect")
          .attr("x", 0)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);
    
      legend.append("text")
          .attr("x", 25)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .text(function(d) { return d; });
    
   }
   if( outputAq.length > 0){
    callAquacultureGraph(outputAq)
    }
  }
  function callAquacultureGraph(outputAq){
  
  var margin = {top: 60, right: 20, bottom: 100, left: 90},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
    
  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
  
  var y = d3.scale.linear()
      .range([height, 0]);
  
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));
  
  var svg = d3.select("#chloroDetails").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    data = outputAq
  
    data.forEach(function(d) {
      d.value= +d.value;
    });
  
    x.domain(data.map(function(d) { return d.species; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);
  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis).selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-30)" 
                });
  
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "translate(-40,0)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Tonnes");
  
    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.species); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });
        
        
      svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(dat[0].region_name +": Top Aquaculture Products");
  
}

  
  
}