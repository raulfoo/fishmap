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
  $("#loadingInitial").css("display","block")

  
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
      
      $("#hide_show").css("display","none")
      $("#hide_show").html("Show Map") 
      getData(arcs,"Fishmeal","true")
      $(".navLinks").css("background-color","white")
      $("#categoryHolder").val("Fishmeal")
      $(this).css("background-color","#FFDC8E")
      $("#groupingTypeHolder").val("species")
    }
    
  });
  
  $("#selectTrade").click(function(){
      if(allowNavigate){
        $("#textSearch").val("")
        $("#regionSubset").val("All")
        $("#amountVal").val(2010)
        
        $("#hide_show").css("display","none")
        $("#hide_show").html("Show Map") 
      
        getData(arcs,"Trade","true")

        $(".navLinks").css("background-color","white")
        $("#categoryHolder").val("Trade")
        $(this).css("background-color","#FFDC8E")
        $("#groupingTypeHolder").val("species")

      }
 
  })
  
  $("#selectCapture").click(function(){

    if(allowNavigate){
      $("#filterThreshold").val(0)
      $("#slider_value_filter").slider('value',0)
      $("#slideFilterValue").text("Show All Countries")
     
      $("#textSearch").val("")
      $("#regionSubset").val("All")
      $("#amountVal").val(2010)
      $("#hide_show").css("display","none")
      $("#hide_show").html("Show Map") 
      getData(arcs,"Production","true")

      $(".navLinks").css("background-color","white")
      $("#categoryHolder").val("Production") 
      $(this).css("background-color","#FFDC8E")
      $("#groupingTypeHolder").val("species")

    }
    
  })
  
   $("#changeFishSelect").click(function () {
     
     if(allowNavigate){
      typeToView = $("#categoryHolder").val();
      getData(arcs,typeToView,"false") //false
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
          $("#groupingTypeHolder").val("species")
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
    click({id: idSearch, playThrough: true})
   
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
        $("#groupingTypeHolder").val("species")

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
    $("#numMatches").html("")
    
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
    
    
    //add a slider that shows max and min values, slide to filter by exporters > or imports >, filter by that number in the database search below
    $.ajax({
        type: 'POST',
        url: '/change_map',
        data: {id: categorySelect, species: speciesSel, metric: per_capita, year: yearVal, filterThreshold: $("#filterThreshold").val()},
        success: function(output) {
          output= JSON.parse(output)
         //console.log(output)
          outputStep = output['map_values']
          rateById.forEach(function(d,i) {this.set(d,0)})
          outputStep = outputStep.sort(compare).reverse()
          outputStepNegatives = outputStep.filter(function(e) { return e["value"]<0})
          outputStepNegatives.forEach(function(e,i){
            e["rank"] = "Importer Rank: " + (i+1)
          })
          outputStepPositives = outputStep.filter(function(e) { return e["value"]>=0})
          compareLength = outputStepPositives.length
          tempCategory = $("#categoryHolder").val()
          
          if(tempCategory == "Production"){
            ["Capture","Aquaculture"].forEach(function(subsetType){
              temp = outputStepPositives.filter(function(k){ return k['subset']==subsetType})
              compareLength = temp.length
              temp.forEach(function(e,i){
                e["rank"] = subsetType+" Production Rank: "+(compareLength-(i))
              })
            })
          
          }else{
            
            outputStepPositives.forEach(function(e,i){
              if(tempCategory == "Production"){
                e["rank"] = "Producer Rank: "+(compareLength-(i))
              }else{
                e["rank"] = "Exporter Rank: " + (compareLength-(i))
              }
            })
          
          }
          outputStep = _.flatten([outputStepNegatives,outputStepPositives])

          lookupCounty = [];
          for(i=0;i<outputStep.length;i++){
            rateById.set(outputStep[i].region_id, outputStep[i].value)
          }
          
          //set slider_value_filter values here with max and min
          
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
        
          for(i in temp){
            partnerDuplicatedCheck = []
            //if(temp[i].length<2) continue
            temp2 = temp[i]
            popIndex = 0
            goodArray = []
            temp[i].forEach(function(e,j){
             spliceCheck = partnerDuplicatedCheck.indexOf(e.partner)
             if(spliceCheck==-1){          
                goodArray.push(e)
             }
              partnerDuplicatedCheck.push(e.partner)
            })
            temp[i] = goodArray
            
          }
          allConnections = temp
        
          maxConnection= output["assocArray"]["max"]
          mouseoverInfo = temp
          
          
          if(thresholdArray.length == 1){
            if(thresholdArray>=0) {
              thresholdArray[0] = thresholdArray[0]+1
            }else{
              thresholdArray[0] =  thresholdArray[0] -1
            }
            //testThresh.push(testThresh[0])
           // testThresh[0]['level_value'] = testThresh[0]['level_value']-1
          }else{

            thresholdArray[thresholdArray.length-1] =  thresholdArray[thresholdArray.length-1]+1
            thresholdArray[0] = thresholdArray[0]+1
          }
       
          var quantizeChange = d3.scale.threshold()
            .domain(thresholdArray)
            .range(d3.range(testThresh.length).map(function(i) { return "q" + i + "-9"; }));
          
          
           var quantizeChangeTest = d3.scale.threshold()
            .domain(thresholdArray)
            .range(d3.range(testThresh.length).map(function(i) { return testThresh[i]['color'] }));
          
          //d3.select("#chloropleth").selectAll("g").selectAll("path").attr("class", function(d) { return quantizeChange(rateById.get(d.id)); })
          arcs.selectAll("path").attr("class", function(d) { 
          tempVal = rateById.get(d.id)
          if(tempVal != 0){
            return quantizeChange(rateById.get(d.id)); 
            }else{
            return "q-99"
            }
          })
          arcs.selectAll("path").style("fill", function(d) { 
           tempVal = rateById.get(d.id)
          if(tempVal != 0){
            return quantizeChangeTest(rateById.get(d.id)); 
            }else{
            return "q-99"
            }
          
          })

      
          /*for(i = 0; i<testThresh.length; i++){
            $(".q"+i+"-9").css("fill",newColors[i])
            
          }*/
          
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
            //console.log(output['absolute_min'])
            //$("#slider_value_filter").slider("option", "min", output['absolute_min'])
            //$("#slider_value_filter").slider("option", "max",  output['absolute_max'])
            //$("#slider_value_filter").slider("option", "step", (output['absolute_max']-output['absolute_min'])/20)
            
            if($("#amountVal").val() !=  $("#slider").slider("value")){
              $("#slider").slider("value",$("#amountVal").val())
            }
            
            $("#amount").html($("#amountVal").val());


            
            $("#loadWarning").css("display","none")
            $("#loadingInitial").css("display","none")
            $("#fullPage").css("visibility","visible")
            allowNavigate = true
            if($("#include_exclude").val()=="include"){
              numCommodities = $("#rightValues").find("option").length
            }else{
              numCommodities = $("#leftValues").find("option").length
            }
            if(numCommodities == 0) numCommodities = $("#leftValues").find("option").length
            $("#numberSpecies").text("# Commodities Displayed: "+numCommodities)
            if( $("#showLastNation").val()=="true") click({id:  $("#regionHolder").val(), playThrough: true})
             $("#showLastNation").val(false)
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
        .style("fill", "none")
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
  
  
  function click(d,event) {
   if(d['playThrough'] == null){
    if($(this)[0]['attributes'][0]['value']=="q-99") return
   }
   if(d['playThrough']=="notnull") event = undefined
  // console.log(event==undefined)
   if(event == undefined || event.altKey == false){
   
  // $("#graphLoadWarning").html("Loading").fadeIn()
  $("#loadWarning").fadeIn()
   
   region_id = d.id
   $("#regionHolder").val(region_id)
   speciesSel = $.map($("#rightValues option"),function(e){return $(e).val()});
   if(speciesSel == "") speciesSel = "All"
   per_capita =  $("input[type='radio'][name='metric']:checked").val()
   $("#nationDetailsChooseYear").css("visibility","")
   //$("#groupingTypeHolder").val("region")
   
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
                      $("#groupingTypeHolder").val("species")


                click_production(infoSelect,$("#graphTypeHolder").val())
              }else if(category == "Fishmeal"){
                click_fishmeal(infoSelect,$("#graphTypeHolder").val())
              }       
              //buildNationalMultiSelect(infoSelect)
              //$(".graphSpeciesChange").fadeIn();    
             $(".graphSpeciesChange").css("visibility","visible")
              //$("#graphLoadWarning").html("").fadeOut('fast')
              $("#loadWarning").html("").fadeOut('fast')

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
   
   
   }else if(event.altKey){
   // console.log(d)
    //alert("hey")
    //mover(d)
    var $container = $('#chloropleth').select("svg").html()
    // Canvg requires trimmed content
    //content = $container.html()//.trim(),
    content = $('#chloropleth').select("svg").html()
    
   
    canvas = document.getElementById('svg-canvas');

    // Draw svg on canvas
    canvg(canvas, content);

    // Change img be SVG representation
    //var theImage = canvas.toDataURL('image/png');
    //$('#svg-img').attr('src', theImage);
    
    



   }else{
 
  
  // $("#graphLoadWarning").html("Loading").fadeIn()
  $("#loadWarning").fadeIn()
   
   region_id = d.id
   $("#regionHolder").val(region_id)
   speciesSel = $.map($("#rightValues option"),function(e){return $(e).val()});
   if(speciesSel == "") speciesSel = "All"
   per_capita =  $("input[type='radio'][name='metric']:checked").val()
   $("#nationDetailsChooseYear").css("visibility","")
   //$("#groupingTypeHolder").val("region")
   
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
                      $("#groupingTypeHolder").val("species")


                click_production(infoSelect,$("#graphTypeHolder").val())
              }else if(category == "Fishmeal"){
                click_fishmeal(infoSelect,$("#graphTypeHolder").val())
              }       
              //buildNationalMultiSelect(infoSelect)
              //$(".graphSpeciesChange").fadeIn();    
             $(".graphSpeciesChange").css("visibility","visible")
              //$("#graphLoadWarning").html("").fadeOut('fast')
              $("#loadWarning").html("").fadeOut('fast')

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
    
  }
  
   function moutgo(d) {
      //$(this).css("stroke-width","1");
      //$(this).css("stroke","#000"); 
      mout(d)
      $(this).parent().find(".arc").css("display","none")
      $("#chloroInformation").html("");
      $("#instructions").html("If you see a color, click on it. Find data sources at bottom of page.")
  }
  
  
  
  
  function mover(d) {
    
    $(this).parent().parent().append($(this).parent())

    $(this).parent().find(".arc").css("display","block")
    tempFullDat = outputStep.filter(function(k) { return k['region_id']==d.id})
    ranks = tempFullDat.map(function(z){ return z['rank']})
    
    fullValue = 0
    tempFullDat.forEach(function(e){
      fullValue+=e['value']
    })
    
    if(fullValue > 1) fullValue = Math.round(fullValue)
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
      
      //totals = 0
      //mouseoverInfo[d.id].forEach(function(d) {totals += d.value});
      topExports = mouseoverInfo[d.id].filter(function(a) {return  a.value > 0})
      topExports = topExports.slice(0,5)
      
      topImports = mouseoverInfo[d.id].filter(function(a) {return a.value < 0})
      topImports = topImports.sort(function(a,b) { return a.value - b.value;}).slice(0,5)
      
      
      $(this).parent().parent().append($(this).parent())
  
      $(this).parent().find(".arc").css("display","block")
      
    
      info = "<div class='mouseoverInfoBlock'><h4>"+  theTest[0].region_name+" (click for more info)</h4>"
      info = info+"<p>Net "+category+": "+commaSeparateNumber(fullValue)+"</p>"
      ranks.forEach(function(z){info = info+"<p>"+z+"</p>"})
    //  info = info+"<p>"+rank+"</p>"
      if(topExports.length>0){
        if(category == "Production"){
          info = info+"<p> Primary Ocean Fisheries</p><table>"
        }else{
        info = info+"<p> Top Export Markets/Destinations </p><table>"
      }
      
      topExports.forEach(function(d){
        info = info + "<tr><td>"+d.partner+"</td><td>"+commaSeparateNumber(d.value)+"</td></tr>"
      })
      
      info = info+"</table>"
      }
      if(topImports.length > 0){
        info = info+"<p> Top Import Markets/Sources </p><table>"
        topImports.forEach(function(d){
          info = info + "<tr><td>"+d.partner+"</td><td>"+commaSeparateNumber(d.value)+"</td></tr>"
        })
       info = info+"</table>"
      }
      info = info+"</div>"
      
      mouseoverMapFunc(d,info)
     
      //$("#chloroInformation").html(info)
      $("#instructions").html("Click to See More "+category+" Information for "+theTest[0].region_name)
      //$(this).css("stroke-width","5");
      //$(this).css("stroke","white");
     
    }
  
  }
  
 
