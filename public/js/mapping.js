var rateById = d3.map()
var outputShow;
var lookupCounty;
var links;
var locationByAirport = [];
var g;
var arcs;
var outputStep;
var mouseoverInfo;
var details;
var connectionArray;
var allConnections;
var testThresh;
var dataOut;
var x;
var allowNavigate = true;
var width = 960,
      height = 500,
      scale,
      trans=[0,0],
      centered;

var projection = d3.geo.equirectangular()
  .scale(150)
  .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var arc = d3.geo.greatArc()
     

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};




$(document).ready(function(){
  
  
  $("#hide_show").click(function(){
  
    if($(this).attr("title") == "show"){
      $("#navigationWrapper").fadeIn('fast', function(){
        $("#hide_show").attr("title","hide")
       $("#hide_show").html("Hide Map") 
      });
      
     
    }else{
     $("#navigationWrapper").fadeOut('fast', function(){
       $("#hide_show").attr("title","show")
       $("#hide_show").html("Show Map")

     });
      
    }
  
  });
  $("#selectFishmeal").css("background-color","#FFDC8E")
  
  $("#selectFishmeal").click(function(){
  
    if(allowNavigate){
      $("#textSearch").val("")
      $("#regionSubset").val("All")
      $("#amountVal").val(2009)
      

      getData(arcs,"Fishmeal","true")
      $(".navLinks").css("background-color","white")
      $("#categoryHolder").val("Fishmeal")
      $(this).css("background-color","#FFDC8E")
    }
    
  });
  
  $("#selectTrade").click(function(){
      if(allowNavigate){
        $("#textSearch").val("")
        $("#regionSubset").val("All")
             $("#amountVal").val(2010)

        getData(arcs,"Trade","true")

        $(".navLinks").css("background-color","white")
        $("#categoryHolder").val("Trade")
        $(this).css("background-color","#FFDC8E")
      }
 
  })
  
  $("#selectCapture").click(function(){

    if(allowNavigate){
      $("#textSearch").val("")
      $("#regionSubset").val("All")
      $("#amountVal").val(2010)

      getData(arcs,"Production","true")

      $(".navLinks").css("background-color","white")
      $("#categoryHolder").val("Production") 
      $(this).css("background-color","#FFDC8E")
    }
    
  })
  
   $("#changeFishSelect").click(function () {
     
     if(allowNavigate){
      typeToView = $("#categoryHolder").val();
      getData(arcs,typeToView,"false")
      }
  
  });
  
  $("#changeFishBottom").click(function () {
    if(allowNavigate){
      if($("#include_excludeBottom").val()=="include"){
        speciesSel = $.map($("#rightValuesBottom option"),function(e){return $(e).val().split("||")[0]});
      }else{
        speciesSel = $.map($("#leftValuesBottom option"),function(e){return $(e).val().split("||")[0]});

      }
      //console.log(speciesSel)
      //console.log($("#groupingTypeHolder").val())
      if(speciesSel == ""){
        infoSelectLimited = infoSelect
      }else if($("#groupingTypeHolder").val() == "region"){
        infoSelectLimited = infoSelect.filter(function(e){ return speciesSel.indexOf(e.partner) >=0 })
      }else{
        infoSelectLimited = infoSelect.filter(function(e){ return speciesSel.indexOf(e.description) >=0 })

      }
      
      //category = infoSelect[0].category
        category = $("#categoryHolder").val() 
        if(category == "Trade"){
          click_trade(infoSelectLimited,$("#graphTypeHolder").val(),"false")
        }else if(category == "Production"){
          click_production(infoSelectLimited,$("#graphTypeHolder").val(),"false")
        }else if(category == "Fishmeal"){
          click_fishmeal(infoSelectLimited,$("#graphTypeHolder").val(),"false")
        }
        
        getRegionRanks($("#regionSubset").val())
      }
   
  
  });
  
  $(document).on("mousedown", ".legendBox", function(){
    //alert("chi");
    tempVar = ($(this).attr("title"));
    selects = ".q"+tempVar+"-9"
    $(selects).css("stroke-width","5");
    $(selects).css("stroke","red");
  });
  
   $(document).on("mouseup", ".legendBox", function(){
    tempVar = ($(this).attr("title"));
    selects = ".q"+tempVar+"-9"
    $(selects).css("stroke-width","1");
    $(selects).css("stroke","#000");
  });
  
  $(document).on("mouseover", ".legendBox", function(){
  
    $(this).css("border-width","1");
    $(this).css("border-color","red");
  });
  
   $(document).on("mouseout", ".legendBox", function(){
  
    $(this).css("border-width","1");
    $(this).css("border-color","black");
  });
  
   $(".changeGraphFromDropDown").change(function(){
   
    idSearch = $("#nationDetailsChoose").val()
    $("#amountVal").val($("#nationDetailsChooseYear").val())
    click({id: idSearch})
   
   })
   
    $("input[type='radio'][name='metric']").change(function(){
      if(allowNavigate){
        typeToView = $("#categoryHolder").val()
        getData(arcs,typeToView,"false")
      }else{
      
        $("input[type='radio'][name='metric']:not(:checked)").attr("checked","true")
      }
    })
   
   $("#textSearch").keyup(function(){
    if($(this).val().length > 2){
      searchText($(this).val());
    
    }else{
      $("#leftValues option:selected").attr("selected",false)
      $("#numMatches").html("")
    
    }
    
   
   
   })
   
   $("#textSearchBottom").keyup(function(){
    if($(this).val().length > 2){
      searchTextBottom($(this).val());
    
    }else{
      $("#leftValuesBottom option:selected").attr("selected",false)
      $("#numMatchesBottom").html("")
    
    }
    
   
   
   })
   
   $("#changeGraphType").click(function(){
    //dat = infoSelect.filter(function(e) { return e.year == 2009})
    
    if($(this).attr("title") != "Timeseries"){
      $(this).attr("title","Timeseries")
      graphType = "Bar Chart"
      $("#nationDetailsChooseYear").css("visibility","")
      $("#graphTypeHolder").val("Bar Chart")
      $("#changeGraphType").html("View Full Time Series")


      
    }else{
      $(this).attr("title","Year")
      graphType = "Time Series"
      $("#nationDetailsChooseYear").css("visibility","hidden")
      $("#graphTypeHolder").val("Time Series")
      $("#changeGraphType").html("View Data for "+$("#amountVal").val())


    }
      category = $("#categoryHolder").val() 
      //category = infoSelect[0].category
      if(category == "Trade"){
        click_trade(infoSelect,graphType)
      }else if(category == "Production"){
        click_production(infoSelect,graphType)
      }else if(category == "Fishmeal"){
        click_fishmeal(infoSelect,graphType)
      }  
      
      getRegionRanks($("#regionSubset").val())
   
   });
   

  
  loadMapData()
  //
  
});  

  function getData(arcs,categorySelect,reset){
    allowNavigate = false
    $("#chloroDetails").html("");
    $(".graphSpeciesChange").fadeOut();
    $("#graphLegend").html("");
    $("#import_Export").fadeOut();
    $("#changeCountryDetails").fadeOut()
    
    arcs.selectAll(".arc").remove()

    $("#loadWarning").fadeIn("fast")
    $("#descriptionTableRight").css("visibility","visible");
    
   
    per_capita =  $("input[type='radio'][name='metric']:checked").val()
    
    if(reset == "true") $("#rightValues").html("")
    if($("#include_exclude").val()=="include"){
      speciesSel = $.map($("#rightValues option"),function(e){return $(e).val()});
    }else{
      speciesSel = $.map($("#leftValues option"),function(e){return $(e).val()});

    }
    if(speciesSel == "") speciesSel = "All"
    
    yearVal = $("#amountVal").val();
    if(categorySelect == "Trade" && yearVal < 1988) yearVal = 1988
    
    $.ajax({
        type: 'POST',
        url: '/change_map',
        data: {id: categorySelect, species: speciesSel, metric: per_capita, year: yearVal},
        success: function(output) {
          output= JSON.parse(output)
          outputStep = output['map_values']
          rateById.forEach(function(d,i) {this.set(d,0)})

          lookupCounty = [];
          for(i=0;i<outputStep.length;i++){
            rateById.set(outputStep[i].region_id, outputStep[i].value)
          }
          
          if(reset == "true"){
          $("#rightValues").html("")
            buildMultiSelect(output['speciesOptions'])
            }
          thresholdArray = output['thresholds']
          
          testThresh = thresholdArray
          
          thresholdArray  = testThresh.map(function(d){ return d.level_value})
          newColors = testThresh.map(function(d){ return d.color})
          
          uniqueNations = output['nationIds']
       
          mouseoverInfo = []
          mouseTemp = []
          temp = []
          
          temp = output["assocArray"]["data"]
          allConnections = temp
          maxConnection= output["assocArray"]["max"]
          mouseoverInfo = temp
   
          thresholdArray[thresholdArray.length-1] =  thresholdArray[thresholdArray.length-1]
          var quantizeChange = d3.scale.threshold()
            .domain(thresholdArray)
            .range(d3.range(testThresh.length).map(function(i) { return "q" + i + "-9"; }));
          
          //d3.select("#chloropleth").selectAll("g").selectAll("path").attr("class", function(d) { return quantizeChange(rateById.get(d.id)); })
          arcs.selectAll("path").attr("class", function(d) { return quantizeChange(rateById.get(d.id)); })
          
      
          for(i = 0; i<testThresh.length; i++){
            $(".q"+i+"-9").css("fill",newColors[i])
            
          }
          
          arcs.selectAll("path").style("fill", function(d) {  
            if(parseFloat(rateById.get(d.id))==0) {
              return "white"
            }else{
              return this.getAttribute("style","fill")
            }
          });

        
          arcs.selectAll("g")
            .data( function(d,i) {return makeConnectionLines(d,i,temp)})
            .enter().append("path")
            .attr("class", "arc")
            .attr("d", function(d) { return path(arc(d)); })
            .style("stroke", function(d) {return selectColor(d)})
            .style("stroke-width", function(d) {return (Math.abs(d.value)/(maxConnection/30))+1});
          
            drawLegend(testThresh)
            
            
            yearMax = output['yearMax']
            if($("#categoryHolder").val() == "Fishmeal"){
              yearMax = Math.min(yearMax,2009)
            }
            yearMin = Math.max(output['yearMin'],1981)
            $("#minTopSlide").html(yearMin)
            $("#maxTopSlide").html(yearMax)
            
            $("#slider").slider("option", "min", yearMin)
            $("#slider").slider("option", "max", yearMax)
            
            if($("#amountVal").val() !=  $("#slider").slider("value")){
              $("#slider").slider("value",$("#amountVal").val())
            }
            
            $("#amount").html("Selected: " + $("#amountVal").val());


            
            $("#loadWarning").fadeOut()
            allowNavigate = true

        }
      });
  
  }
  
  function selectColor(id){
    if(id.value < 0){
      return "red"
      }else{
      return "blue"
      }
  }
  
  function makeConnectionLines(d,i,bigLinks){
    
    if(d.id in bigLinks){
      return bigLinks[d.id]
    }else return 0
  }
 
   
 
      

            
  function loadMapData(){
  
    queue()
        .defer(d3.json, "/json/fisheries.json")
        .defer(d3.json, "/json/nations.json")
        .await(ready);
  }

  
  function ready(error, us, no_oceans) {
     var path = d3.geo.path().projection(projection);
  
     var arc = d3.geo.greatArc();
     var links = []
      
     var svg = d3.select("#chloropleth").append("svg")
        .attr("width", width)
        .attr("height", height)


    
    dataOut = us
  
    arcs = svg.append("svg:g")
        .attr("class", "countries")
      .selectAll("g")
        .data(topojson.feature(us, us.objects.fishery_map_raw).features)
      .enter().append("svg:g")
    
    arcs.append("path")
        .attr("class", "regions")
        .attr("d", path)
        .on("mouseover",mover)
        .on("mouseout",moutgo)
        .on("click", click)
        
    var noOcean = svg.append("svg:g")
        .attr("class", "no_oceans")
      .selectAll("g")
        .data(topojson.feature(no_oceans, no_oceans.objects.world_nations).features)
      .enter().append("svg:g")
      
      noOcean.append("path")
        .attr("class", "regions")
        .attr("d", path)
      
    
    getData(arcs,"Fishmeal","true");
              
  }
  
  
  function click(d) {
  
   $("#graphLoadWarning").html("Loading").fadeIn()
   
   region_id = d.id
   $("#regionHolder").val(region_id)
   speciesSel = $.map($("#rightValues option"),function(e){return $(e).val()});
   if(speciesSel == "") speciesSel = "All"
   per_capita =  $("input[type='radio'][name='metric']:checked").val()
   $("#nationDetailsChooseYear").css("visibility","")
   $("#groupingTypeHolder").val("region")
   
   $.ajax({
        type: 'POST',
        url: '/getDetails',
        data: {type: $("#categoryHolder").val(), region: region_id, species: speciesSel, metric: per_capita, year: $("#amountVal").val()},
        success: function(output) {
          output = JSON.parse(output)
          output = output["details"]
          //details = output.filter(function(e) { return e.year == 2009})
          details = output
      
          theTest = outputStep.filter(function(nation) { return nation.region_id == d.id});
          if(theTest.length > 0){
            infoSelect = details.filter(function(nation) { return nation.region_id == d.id});
            
            
            if(infoSelect.length>0){ 
              category = $("#categoryHolder").val() 
              if(category == "Trade"){
                click_trade(infoSelect,$("#graphTypeHolder").val())
              }else if(category == "Production"){
                click_production(infoSelect,$("#graphTypeHolder").val())
              }else if(category == "Fishmeal"){
                click_fishmeal(infoSelect,$("#graphTypeHolder").val())
              }       
              //buildNationalMultiSelect(infoSelect)
              //$(".graphSpeciesChange").fadeIn();    
             $(".graphSpeciesChange").css("visibility","visible")
              $("#graphLoadWarning").html("").fadeOut('fast')

              $("#changeCountryDetails").fadeIn()
              //if($("#changeGraphType").html() == "View Full Time Series"){
                 
                  
                  //buildRegionSelect(outputStep,d.id,category)
                  getRegionRanks($("#regionSubset").val())
               // }else{
                //  buildRegionSelect(outputStep.filter(function(e) { return e.year == $("#amountVal").val()}),d.id,category)
               // }
            }else{
              disclaim = "No data, currently details for '"+details[0].category+"' are limited to the top 10 species.\n"+
              "None of the fish species fell within that range for " + d.id;
              $("#chloroDetails").html(disclaim)
              $("#graphLegend").html("")
            }
          }
          
          $("#navigationWrapper").css("display","none")
          $("#hide_show").html("Show Map")
          $("#hide_show").attr("title","show")
          $("#hide_show").fadeIn();
         }
         
     

      })
    
  }
  
   function moutgo(d) {
      //$(this).css("stroke-width","1");
      //$(this).css("stroke","#000"); 
      
      $(this).parent().find(".arc").css("display","none")
      $("#chloroInformation").html("");
      $("#instructions").html("If you see a color, click on it")
  }
  
  
  
  
  function mover(d) {
    
    $(this).parent().parent().append($(this).parent())

    $(this).parent().find(".arc").css("display","block")
    
    theTest = outputStep.filter(function(nation) { return nation.region_id == d.id})
    category = $("#categoryHolder").val() 
    if(mouseoverInfo[d.id] && theTest.length>0){
      /*if($("#selectCapture").css("background-color") != "rgb(255, 255, 255)" && $("#selectCapture").css("background-color") != "rgba(0, 0, 0, 0)"){
        category = "Production"
      }else{
        category = "Trade"
      }*/
 
          
      mouseoverInfo[d.id].sort(function(a, b) {
        return b.value - a.value;
      });
      
      totals = 0
      mouseoverInfo[d.id].forEach(function(d) {totals += d.value});
      topExports = mouseoverInfo[d.id].filter(function(a) {return  a.value > 0})
      topExports = topExports.slice(0,5)
      
      topImports = mouseoverInfo[d.id].filter(function(a) {return a.value < 0})
      topImports = topImports.sort(function(a,b) { return a.value - b.value;}).slice(0,5)
      
      
      $(this).parent().parent().append($(this).parent())
  
      $(this).parent().find(".arc").css("display","block")
      
    
      info = "<div class='mouseoverInfoBlock'><p> Current Region: "+  theTest[0].region_name+"</p>"
      info = info+"<p>Net "+category+": "+commaSeparateNumber(Math.round(totals*100)/100)+"</p>"
   
      if(topExports.length>0){
        if(category == "Production"){
          info = info+"<p> Primary Ocean Fisheries</p><table>"
        }else{
        info = info+"<p> Top Export Markets/Destination</p><table>"
      }
      
      topExports.forEach(function(d){
        info = info + "<tr><td>"+d.partner+"</td><td>"+commaSeparateNumber(d.value)+"</td></tr>"
      })
      
      info = info+"</table>"
      }
      if(topImports.length > 0){
        info = info+"<p> Top Import Markets/Sources</p><table>"
        topImports.forEach(function(d){
          info = info + "<tr><td>"+d.partner+"</td><td>"+commaSeparateNumber(d.value)+"</td></tr>"
        })
       info = info+"</table>"
      }
      info = info+"</div>"
     
      $("#chloroInformation").html(info)
      $("#instructions").html("Click to See More "+category+" Information for "+theTest[0].region_name)
      //$(this).css("stroke-width","5");
      //$(this).css("stroke","white");
     
    }
  
  }
  
 
