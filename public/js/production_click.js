function click_production(dat,graphType,buildNewSelection){
  buildNewSelection = buildNewSelection || true

  graphType = graphType || "Bar Chart"

  realRawDat = dat
  dat = dat.filter(function(e) { return e.year == $("#amountVal").val()})
  
  //sortType = "region"
  sortType = $("#groupingTypeHolder").val()
  if(graphType == "Bar Chart"){
    prepareData(dat,sortType,buildNewSelection);
  }else{
    prepareTimeSeries(realRawDat,sortType,buildNewSelection)
  }
  $("#textSearchBottom").val("")
  
  
  function prepareTimeSeries(dat,sortType,buildNewSelection){
    buildNewSelection = buildNewSelection || true

  
    $("#groupingTypeHolder").val(sortType)
    if(buildNewSelection==true){
      buildNationalMultiSelect(dat,sortType)
    }
    $(".graphSpeciesChange").fadeIn();   
    
    //$("#changeGraphType").html("View Current Year")

    $("#chloroDetails").html("");
    $("#graphLegend").html("");
    $("#import_Export").fadeOut();
    
    
    datCapture = dat.filter(function(e) { return e.subset == "Capture" })
    datAq = dat.filter(function(e) { return e.subset == "Aquaculture" })
    
    captureTotals = 0
    datCapture.forEach(function(e){ captureTotals+= e.value})
    aqTotals = 0
    datAq.forEach(function(e){ aqTotals+= e.value})
     
    summaryContent = "<table><tr><td><a>Total Production: </a></td><td>"+commaSeparateNumber(decimalRound(captureTotals+aqTotals))+
    "</td></tr><tr><td><a  title='Capture'>Capture Production: </a></td><td>"+commaSeparateNumber(decimalRound(captureTotals))+
    "</td></tr><tr><td><a title='Aquaculture'>Aquaculture Production: </a></td><td>"+commaSeparateNumber(decimalRound(aqTotals))+"</td></tr></table>"
     
     
    $("#totalsSummary").html(summaryContent)
    
    bigOut = []
    testArray = [datAq,datCapture]
    testArray.forEach(function(dataSet){
    
      //try just sending the current year
      returnOutput = categorySelect(dataSet.filter(function(e) { return e.year == $("#amountVal").val()}),sortType)
      
      firstSelect = returnOutput["firstSelect"]
      secondSelect = returnOutput["secondSelect"]
      partners = returnOutput["partners"]
      uniqueFish = returnOutput["uniqueFish"]
  
   
      partners.forEach(function(type){
        temp = dataSet.filter(function(cat) { return cat[firstSelect] == type});
        output = []
        outputTracker = 0
        if(temp){
          jsObj = {}
          jsObj["State"] = type
          uniqueFish.forEach(function(fish){
           
            x = temp.filter(function(y) { return y[secondSelect] == fish});
            tempOut = []
            
            
            if(x.length>0){
              valuesArray = []
              
              x.sort(compareYear).filter(function(e){
                valuesArray.push({year: e.year, graphValue: e.value})
                
              })
              
              if(valuesArray.length > 4){
                tempOut = {name: x[0][secondSelect], type : type, values: valuesArray, tradeType: x[0]['subset']}
                output.push(tempOut)
                valuesArray.forEach(function(e){
                  outputTracker+=e.graphValue
                })
              }
              
              //jsObj[fish] = x[0].value
              //tempOut.push(jsObj)
            
    
              }
          });
          
          if(output.length>0){
            bigOut.push({'output': output, 'value' : outputTracker} )
           }
        }
        //add elements for title and maybe for legend
   
    });
    
  });
   
   bigOut.sort(compare)
   bigOut.forEach(function(d){ 
    time_series_graph(d.output,sortType,dat,uniqueFish)
   });

  
  }
  
  

  function prepareData(dat,sortType,buildNewSelection){
    captureTotals = 0
    buildNewSelection = buildNewSelection || true

    $("#groupingTypeHolder").val(sortType)

    if(buildNewSelection==true){
      buildNationalMultiSelect(dat,sortType)
    }
    $(".graphSpeciesChange").fadeIn();   
    
   // $("#changeGraphType").html("View Full Time Series")

    
    $("#chloroDetails").html("");
    $("#graphLegend").html("");
    $("#import_Export").fadeOut();
   
    datCapture = dat.filter(function(e) { return e.subset == "Capture" })
    datAq = dat.filter(function(e) { return e.subset == "Aquaculture" })
    
    
     captureTotals = 0
     datCapture.forEach(function(e){ captureTotals+= e.value})
     aqTotals = 0
     datAq.forEach(function(e){ aqTotals+= e.value})
     
     summaryContent = "<table><tr><td><a title='All'>Total Production: </a></td><td>"+commaSeparateNumber(decimalRound(captureTotals+aqTotals))+
     "</td></tr><tr><td><a title='Capture'>Capture Production: </a></td><td>"+commaSeparateNumber(decimalRound(captureTotals))+
     "</td></tr><tr><td><a title='Aquaculture'>Aquaculture Production: </a></td><td>"+commaSeparateNumber(decimalRound(aqTotals))+"</td></tr></table>"
     
     
    $("#totalsSummary").html(summaryContent)
   
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
    datAq.sort(compare)
    datAq = datAq.slice(0,15)
    datAq = datAq.reverse()
    datAq.forEach(function(x){
    
      outputAq.push({species: x.description, value: x.value}) 
    
    });
    outputAq.reverse()
    
    graph(output,outputAq,sortType,dat,uniqueFish)
    
  }
  
  
  function graph(output,outputAq,sortType,rawData,uniqueFish){
    if(sortType == "region"){
      switchSort = "species"
      
      }else{
      
      switchSort = "region"
      }
      
    textType = "Tonnes"
    if($("input[type='radio'][name='metric']:checked").val()=="T"){
      textType = "Kg/Person"
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
        d.ages = ageNames.map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], column: d.State, date: rawData[0].year}; });
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
          .attr("transform","translate(-60,0)rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(textType);
    
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
          .on("mouseover", function(d,i) {mouseoverFunc(d,i,rawData,switchSort,true)})
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
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");
        
      legend = svg1.selectAll(".legend")
          .data(ageNames.slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
          .on("click",function(d) { prepareData(dat,switchSort,true)})

      
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
        .attr("transform","translate(-60,0)rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(textType);
  
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

 function time_series_graph(output,sortType,rawData,uniqueFish){
 
 if(sortType == "region"){
      switchSort = "species"
      
      }else{
      
      switchSort = "region"
      }
      
    textType = "Tonnes"
    if($("input[type='radio'][name='metric']:checked").val()=="T"){
      textType = "Kg/Person"
    }
      
     var margin = {top: 60, right: 20, bottom: 30, left: 90},
       width = 960 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;
    
     var parseDate = d3.time.format("%Y").parse;
    
     var x = d3.time.scale()
      .range([0, width]);
    
     var y = d3.scale.linear()
      .range([height, 0]);
    
     var color = d3.scale.category10();
    
     var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
    
     var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));
    
     var line = d3.svg.line()
      .interpolate("cardinal")
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.graphValue); });
    
     var svg = d3.select("#chloroDetails").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
     .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
   
    
     color.domain(d3.keys(output).filter(function(key) { return key == "name"; }));
     output.forEach(function(d) {
      d.values.forEach(function(e){
        e.date = e.year
        e.year = parseDate(String(e.year));
        e.name = d.name
        e.column = output[0].type
      });
     });
     

     cities = output
     ageNames = cities.map(function(e) { return e.name})

     
     //x.domain(d3.extent(cities, function(d) { return d.values.date; }));
     x.domain([parseDate("1980"),parseDate("2010")])
     y.domain([
      d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.graphValue; }); }),
      d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.graphValue; }); })
    ]);
    
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(textType);
    
    var city = svg.selectAll(".city")
        .data(cities)
      .enter().append("g")
        .attr("class", "city");
    
    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });
    
         
    cities.forEach(function(thisCity){
      thisName = thisCity.name
      var points = svg.selectAll(".point")
        .data(thisCity.values)
      .enter().append("svg:circle")
         .attr("stroke", "black")
         .attr("fill", function(d, i) { return color(thisName) })
         .attr("cx", function(d, i) { return x(d.year) })
         .attr("cy", function(d, i) { return y(d.graphValue) })
         .attr("r", function(d, i) { return 3 })
         .on("mouseover", function(d,i) {mouseoverFunc(d,i,rawData,switchSort)})
         .on("mouseout", mout)
         .on("click", function(d) {prepareTimeSeries(rawData,switchSort,true)});


      })
        
        
    var svg1 = d3.select("#graphLegend").append("svg")
        .attr("width", 200 + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");
        
    var legend = svg1.selectAll(".legend")
        .data(ageNames.slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"})
        .on("click", function(d) {prepareTimeSeries(rawData,switchSort,true)});

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
        

    svg.append("text")
      .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(cities[0].type+", "+cities[0].tradeType);
    
    
    
   
   }

  
  
}