
function click_trade(dat){

  sortType = "region"
  prepareData(dat,sortType);
  
  function prepareData(dat,sortType){

    $("#chloroDetails").html("");
    $("#graphLegend").html("");
  
  
    returnOutput = categorySelect(dat,sortType)
    
    firstSelect = returnOutput["firstSelect"]
    secondSelect = returnOutput["secondSelect"]
    partners = returnOutput["partners"]
    uniqueFish = returnOutput["uniqueFish"]
    
  
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
    d.ages = ageNames.map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], column: d.State, tradeType: tradeType}; });
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
       .on("click", function(d) {prepareData(dat,switchSort)})
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

 $("#import_Export").fadeIn();
  }
  
 
}


