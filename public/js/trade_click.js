
function click_trade(dat,graphType,buildNewSelection){
  
  graphType = graphType || "Bar Chart"
  buildNewSelection = buildNewSelection || true

  realRawDat = dat
  dat = dat.filter(function(e) { return e.year == $("#amountVal").val()})
  
  sortType = $("#groupingTypeHolder").val()
  
  if(graphType == "Bar Chart"){
    prepareData(dat,sortType, buildNewSelection);
  }else{
    prepareTimeSeries(realRawDat,sortType,dat, buildNewSelection)
  }
  $("#textSearchBottom").val("")
  
  
  
  
   function prepareTimeSeries(dat,sortType,limitedDat,buildNewSelection){    
    buildNewSelection = buildNewSelection || true

    $("#groupingTypeHolder").val(sortType)
    if(buildNewSelection == true){
      buildNationalMultiSelect(dat,sortType)
    }
    $(".graphSpeciesChange").fadeIn();   
    
    $("#graphLoadWarning").html("Loading")
   
   // $("#changeGraphType").html("View Current Year")

    $("#chloroDetails").html("");
    $("#graphLegend").html("");
    $("#import_Export").fadeOut();
    returnOutput = categorySelect(limitedDat,sortType) //all the time is taken up here
    datExport = dat.filter(function(e) { return e.subset == "Export" })
    datImport = dat.filter(function(e) { return e.subset == "Import" })
    
    firstSelect = returnOutput["firstSelect"]
    secondSelect = returnOutput["secondSelect"]
    partners = returnOutput["partners"]
    uniqueFish = returnOutput["uniqueFish"]
    bigOut = []
    
    exportTotals = 0
    datExport.forEach(function(e){ exportTotals+= e.value})
    importTotals = 0
    datImport.forEach(function(e){ importTotals+= e.value})
   
    summaryContent = "<table><tr><td><a title = 'All'>Gross Trade: </a></td><td>"+commaSeparateNumber(decimalRound(exportTotals+importTotals))+
    "</td></tr><tr><td><a title = 'Export'>Exports: </a></td><td>"+commaSeparateNumber(decimalRound(exportTotals))+
    "</td></tr><tr><td><a title = 'Import'>Imports: </a></td><td>"+commaSeparateNumber(decimalRound(importTotals))+"</td></tr></table>"
   
   
    $("#totalsSummary").html(summaryContent)
    
    
 
    index = 1
    partners.forEach(function(type){
      temp = dat.filter(function(cat) { return cat[firstSelect] == type});
      output = []
      outputTracker = 0

      if(temp){
        ["Import","Export"].forEach(function(tradeType){
          //jsObj = {}
          //jsObj["State"] = type
          
          
          
          g = temp.filter(function(y) { return y.subset == tradeType});
          uniqueFish.forEach(function(fish){
           
            x = g.filter(function(y) { return y[secondSelect] == fish});
            
            
            if(x.length>0){
              valuesArray = []
              
              x.sort(compareYear).filter(function(e){
                valuesArray.push({year: e.year, graphValue: e.value})
                
              })
              
              if(valuesArray.length > 4){
                tempOut = {name: x[0][secondSelect], type : type, values: valuesArray, tradeType: tradeType}
                output.push(tempOut)
                 valuesArray.forEach(function(e){
                  outputTracker+=e.graphValue
                })
              }
              
              //jsObj[fish] = x[0].value
              //tempOut.push(jsObj)
            
    
              }
          });
        });
        
        if(output.length>0){
          //bigOut.push(output)
             bigOut.push({'output': output, 'value' : outputTracker} )
           
         }
      }
    //add elements for title and maybe for legend

  });
  
  
   bigOut.sort(compare)
   bigOut.forEach(function(d){ 
    time_series_graph(d.output,sortType,dat,uniqueFish,limitedDat)
   });
   $("#graphLoadWarning").html("")

  
  }
  
  
  function prepareData(dat,sortType,buildNewSelection){
    $("#groupingTypeHolder").val(sortType)
    
    buildNewSelection = buildNewSelection || true
    if(buildNewSelection==true){
      buildNationalMultiSelect(dat,sortType)
    }
    $(".graphSpeciesChange").fadeIn();    
    
    $("#graphLoadWarning").html("Loading")

    $("#chloroDetails").html("");
    $("#graphLegend").html("");
    
    //$("#changeGraphType").html("View Full Time Series")

  
  
    returnOutput = categorySelect(dat,sortType)
    
    firstSelect = returnOutput["firstSelect"]
    secondSelect = returnOutput["secondSelect"]
    partners = returnOutput["partners"]
    uniqueFish = returnOutput["uniqueFish"]
    
    datExport = dat.filter(function(e) { return e.subset == "Export" })
    datImport = dat.filter(function(e) { return e.subset == "Import" })
    
    exportTotals = 0
    datExport.forEach(function(e){ exportTotals+= e.value})
    importTotals = 0
    datImport.forEach(function(e){ importTotals+= e.value})
   
    summaryContent = "<table><tr><td><a title = 'All'>Net Trade: </a></td><td>"+commaSeparateNumber(decimalRound(exportTotals+importTotals))+
    "</td></tr><tr><td><a title = 'Export'>Gross Exports: </a></td><td>"+commaSeparateNumber(decimalRound(exportTotals))+
    "</td></tr><tr><td><a title = 'Import'>Gross Imports: </a></td><td>"+commaSeparateNumber(decimalRound(importTotals))+"</td></tr></table>"
   
   
    $("#totalsSummary").html(summaryContent)
   
  
  output = []
  output["Import"] = []
  output["Export"] = []
  
  sumArray = []
  sumArray["Export"] = 0
  sumArray["Import"] = 0
  maxVal = 0
  
  search_filter = partners
  search_filter.forEach(function(type){
    temp = dat.filter(function(cat) { return cat[firstSelect] == type});
    if(temp){
      ["Import","Export"].forEach(function(tradeType){
      tempOut = []
      jsObj = {}
      jsObj["State"] = type
      
      g = temp.filter(function(y) { return y.subset == tradeType});
      
      uniqueFish.forEach(function(fish){
        x = g.filter(function(y) { return y[secondSelect] == fish});
       
        if(x.length>0){
         
          jsObj[fish] = x[0].value
          tempOut.push(jsObj)
          if(maxVal < Math.abs(x[0].value)){
            maxVal = Math.abs(x[0].value)
            sumArray[tradeType] = maxVal
            }
          }else{
           jsObj[fish] = 0
           tempOut.push(jsObj)
          }
      });
      output[tradeType].push(tempOut[0])
      });
    
      
    }
  
  });
  

 
  if (sumArray["Export"] > sumArray["Import"]){
    rankChoose = output["Export"]
    domainSelect = 1
  
  }else{
     rankChoose = output["Import"]
     domainSelect = 0
  }
  
 
  output = [output["Import"],output["Export"]]

  graph(output,sortType,dat,uniqueFish,domainSelect)
  $("#graphLoadWarning").html("")


}
  
    function graph(output,sortType,rawData,uniqueFish,domainSelect){
    
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

var svg = d3.select("#chloroDetails").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  data = output
  var ageNames = uniqueFish

  tradeSelect = 0
  data.forEach(function(e) {
    tradeType = ["Import","Export"][tradeSelect]
    e.forEach(function(d){
    var y0 = 0
    d.ages = ageNames.map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], column: d.State, tradeType: tradeType, date: rawData[0].year}; });
    d.total = d.ages[d.ages.length - 1].y1;
  });
  tradeSelect +=1
  });
  
  
  x.domain(data[domainSelect].map(function(d) { return d.State; }));
  x1.domain(data[domainSelect].map(function(d) { return d.State; }));

  y.domain([0, d3.max(data[domainSelect], function(d) { return d.total; })]);
  
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
                
  textType = "Tonnes"
  if($("input[type='radio'][name='metric']:checked").val()=="T"){
    textType = "Kg/Person"
  }
  
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
      .attr("class", "series")
  
      .attr("transform", function (d, i) { return "translate(" + x(i)/3 + ")" });
  
  var interStep =  state.selectAll("rect")
    .data(Object)
    .enter().append("g")
     .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

  var finalStep = interStep.selectAll("rect")
      .data(function(d) { return d.ages; })
    .enter().append("rect")
      .attr("width", x.rangeBand()/3)
       .attr("y", function(d) {  return y(d.y1);  })
      .attr("height", function(d) { return y(d.y0) - y(d.y1);})
       .style("fill", function(d) { return color(d.name); })
       .style("stroke", function(d) {return "black"})
       .style("stroke-width", function(d) { return chooseTradeType(d); })
       .on("click", function(d) {prepareData(dat,switchSort,true)})
       .on("mouseover", function(d,i) {mouseoverFunc(d,i,rawData,switchSort)})
       .on("mouseout", mout)
  
    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(rawData[0].region_name +": Trade clustered by "+sortType);

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

 $("#import_Export").fadeIn();
  }
  
   function time_series_graph(output,sortType,rawData,uniqueFish,limitedDat){
   
   if(sortType == "region"){
      switchSort = "species"
       titleText = "with"
      
      }else{
      
      switchSort = "region"
      titleText = "of"
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
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      
      ageNames  = output.map(function(e){ return e.name});
       ageNames  = $.grep( ageNames , function(v, k){
        return $.inArray(v ,ageNames) === k;
      });
    
     color.domain( ageNames );
     output.forEach(function(d) {
      d.values.forEach(function(e){
        e.date = e.year
        e.year = parseDate(String(e.year));
        e.name = d.name
        e.column = output[0].type
        e.tradeType = d.tradeType
      });
     });
     

     cities = output

     
     //x.domain(d3.extent(cities, function(d) { return d.values.date; }));
     x.domain([parseDate("1988"),parseDate("2010")])
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
        .text(textType)
    
    var city = svg.selectAll(".city")
        .data(cities)
      .enter().append("g")
        .attr("class", "city")
       

    
    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); })
        .style("stroke-dasharray", function(d){
          if(d.tradeType == "Import"){
            return ("3, 3")
          }else{
            return 0
          }
        })
        
        
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

    /*city.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.graphValue) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });*/
        
    var svg1 = d3.select("#graphLegend").append("svg")
        .attr("width", 200 + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");
        
    var legend = svg1.selectAll(".legend")
        .data(ageNames.slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
        .on("click", function(d) {prepareTimeSeries(rawData,switchSort,limitedDat,true)});

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
        
   
    var legend1 = svg1.selectAll(".legend1")
        .data(["Import","Export"])
        .enter().append("g")
        .attr("class", "legend1")
        .attr("transform", function(d, i) { return "translate(0," + ((ageNames.length+i+1) * 20)+")"; });

    legend1.append("path")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("d", "m0 9 l18 0")
        //.attr("transform", function(d, i) { return "translate(0," + (ageNames.lengthi * 20)+")"; })
        .style("stroke-width", "2")
        .style("stroke", "black")
        .style("stroke-dasharray", function(d){
  
          if(d == "Import"){
            return ("3, 3")
          }else{
            return 0
          }
        })
  
    legend1.append("text")
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
        .text(rawData[0].region_name+" trade "+titleText+" "+cities[0].type);
    
    
    
   
   }

  
 
}


