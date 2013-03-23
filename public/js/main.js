var barGraph;
var annotatedtimeline;
   
$(document).ready(function(){
   
   if($('input[name=income]').val() != null){
    setCookie("income",$('input[name=income]').val(),1);
   }
   loadCookies();
   
   $(".programSort").change(function(){
     var level = $(this).attr('id');
     var data = $(this).val();
     var allFollowing = $(this).parent().parent().nextAll();
     program_name = $(this).find("option:selected").html();
   
     allFollowing.remove(); 
     continueBrowse(level,data,program_name)
   
   });
   
  $('.govtProgramsWrapper').on('change','input[type=radio]', function(){
    
     
      //var x = $(this).parent().find("input[type=radio]:checked")
      var budgetType = $(this).val()
      var graphType = $(this).closest(".programDataBottomRow").find("option:selected").val();
     
      id = $(this).closest(".projectLevelWrap").attr("id");
      findData(id,1,true,null,budgetType,graphType);
  });
  
  $(".govtProgramsWrapper").on('click', ".nestedSliderButton" ,function(){
    currentNest =  parseInt($(this).closest(".projectLevelWrap").find(".levelValue").val())
    maxNest = parseInt($(this).closest(".projectLevelWrap").find(".maxValue").val())
  
    if($(this).text() == "<-- Less General"){
      levelValue = Math.max(currentNest-1,1);
    
    }else{
      levelValue = Math.min(currentNest+1,maxNest);
    
    }
   
    graphType = $(this).closest(".projectLevelWrap").find("option:selected").val()
    budgetType = $(this).closest(".projectLevelWrap").find(".budgetType").val()
    id = $(this).closest(".projectLevelWrap").attr("id");
    
    findData(id,parseInt(levelValue),true,null,budgetType,graphType);

  });
  
  $(".govtProgramsWrapper").on('click', ".seeGraphs", function(){
   
    if($(this).text() == "Hide"){
      $(this).closest(".projectLevelWrap").find(".programDataBottomRow").fadeOut("fast");
      $(this).text("View More (Graphs)");
    }else{
      $(this).closest(".projectLevelWrap").find(".programDataBottomRow").fadeIn("fast");
      $(this).text("Hide");
    }
  });
  
  $("#hideBrowsing").click(function(){
    if($(this).text() == "Click to Hide Browsing"){
      $("#tabs").fadeOut();
      $(this).text("Show Browsing")
    }else{
      $("#tabs").fadeIn();
      $(".govtProgramsWrapper").css("display","hidden");
      $(this).text("Browse:") 
    }
  });
  
  $("#hideBrowsing").mouseover(function(){
    if($(this).text() == "Browse:"){
      $(this).text("Click to Hide Browsing")
    }
  });
  
  $("#hideBrowsing").mouseout(function(){
    if($(this).text() == "Click to Hide Browsing"){
      $(this).text("Browse:")
    }
  });
  
   
});
 


function removeMe(e){
  numViews = $(".programsList").children().length
  
  e.closest(".projectLevelWrap").fadeOut(function(){
     e.closest(".projectLevelWrap").remove();
  });
  if(numViews == 1){
    $("#clearAll").fadeOut();
  }

}


function clearAll(search){
  if($(".programsList").children().length <1) {
    return
  }
   
 
  if(search==true){
    $(".programsList").children().remove();
  }
  if(search==false){
    $("#clearAll").fadeOut();
    $(".govtProgramsWrapper").fadeOut(function(){
    $(".programsList").children().remove()
    });
    
  }
}


  
  


function progSelect(e){
  
  var level = e.attr('id');
  var data = e.val();
  program_name = e.find("option:selected").html();

  test = false  
  aggregateTestRegex = new RegExp("(All -- List)|(All -- Total)")
  check = program_name.match(aggregateTestRegex)
  
  if(check != null){
    test = true
  }
  
  if(level != "program" && test==false){
  
    if(data != "none"){
      
      var allFollowing = e.parent().parent().nextAll();
     
      allFollowing.remove(); 
      continueBrowse(level,data,program_name);
    }else{
      return
    }
  }else{
    
     findData(data,1,false,null,"budget_percent","line");
  
  }
}


function continueBrowse(level,data,title){
 
  
  $.ajax({
      type: 'GET',
      url: '/specify_program',
      data: {id: data, level: level, title: title},
      success: function(output) {
      
        $("#browseWrap").append(output);
      }
    
    });
}
  
  

function findData(data,nesting,makeNew,child,budgetType,graphType){
  //remove all weird google chart divs they make every time you change anything, maybe this frees up memory

  $("#footer").nextAll().remove()
  $("#stepTwo").fadeOut();
  $("#searching").css("visibility","visible");
  navigationId = data;
  if(barGraph != null){
    barGraph.clearChart();
  }
  if(annotatedtimeline != null){
    annotatedtimeline.clearChart();
  }
  
  var proportion = parseFloat($("#federalTaxes").val());
  var allTax = parseFloat($("#totalRevenues").val());
  
   if(makeNew != true){
     setCookie('lastSelection',data,1)
   }

  $.ajax({
    type: 'GET',
    url: '/show_program',
    data: {public_id: data, nesting: nesting, makeNew: makeNew, budget_type: budgetType, graph_type: graphType},
    success: function(output) {
      outputBig = JSON.parse(output);
      output = outputBig['mainOut']
      
      linkName = outputBig['links']
      
      title = output[0]['current']['title'];
  
      linkTitleHeader = output[0]['grandparent']
    
      if(makeNew != true && makeNew != "search"){
       
        clearAll(true);
      }
      
       if(makeNew != true){
     
    
         tempIdArray =getCookie('navigationID');
         if(tempIdArray == null){
       
          tempIdArray = new Array(linkTitleHeader);
          }else{
            tempIdArray = tempIdArray.split("|");
            tempIdArray.push(String(linkTitleHeader));
          }
       }
      
      
      $("#clearAll").fadeIn('fast');
      createOutput(output,makeNew,child,budgetType,nesting,proportion,allTax,graphType)
      $("#searching").css("visibility","hidden")
      $('.govtProgramsWrapper').fadeIn('fast')
     
      if(makeNew != true){
        
        links = '<ul><a class="navigate" onclick="fastNavigate('+data+')">'+linkTitleHeader+'</a></ul>'
      
        updateNavigation(links,linkTitleHeader,tempIdArray)
      }
    }  
  });
}

function updateNavigation(links,navigationId,idArray){

  maxAmount = 8
  currentAmount = $("#navigationWrapper").children().length

  checkRecent = idArray.indexOf(String(navigationId))

  if(checkRecent != -1 && checkRecent != (idArray.length-1)){//&& checkRecent != (idArray.length-1)
  
    if(checkRecent == 0){
      idArray.shift()
    }else{
      idArray.splice(checkRecent,1);
    }
    wrapRemove =  currentAmount-checkRecent-1
    currentAmount= currentAmount-1
    $("#navigationWrapper").children().eq(wrapRemove).remove()
    
  }
  cookieOut = idArray.join("|")
  setCookie('navigationID',cookieOut,1)
  if(idArray.length<3){
    $("#navSorting").fadeOut();
  }else{
    $("#navSorting").fadeIn();
  }

  //if(links != "<ul>"+$("#navigationWrapper").children().eq(0).html()+"</ul>"){
    /*if($("#navigationWrapper").children().eq(0).html().match(/.*:/) == links.match(/.*:/)[0].substr(4)){
   
      $("#navigationWrapper").children().eq(0).html($("#navigationWrapper").children().eq(0).html().replace(/.*<li>/,"<li>"))
    }*/
    $("#navigationHeader").fadeIn();
      if(currentAmount >=maxAmount){
    
        for(var i = maxAmount; i<= currentAmount; i++){
         $("#navigationWrapper").children().eq(i).remove();
        }
      }  
    $("#navigationWrapper").prepend(links);
   
    forCookie = $("#navigationWrapper").html()
    if(currentAmount>1){
      $("#navSorting").css("visibility","visible");
    }
    //forCookie = forCookie.replace("&gt;","")
    setCookie('navigation',forCookie,1)
  //}
 
//update the cookie with the new navigationWrapper.html here  
}


function searchChild(id){
 
  //child = child+"_divIndex";
  child = null
  findData(id,1,"child",child,"budget_percent","line");
 
}



function createOutput(outputBig,makeNew,child,budgetType,nesting,proportion,allTax,graphType){
 
  for(outputIndex = 0; outputIndex < outputBig.length; outputIndex++){
   
    output = outputBig[outputIndex];
    title = output['current']['title'];
    
    maxNest = parseInt(output['nesting_level_possible']);
    
    currentNest = parseInt(output['nesting_level_current']);
    //bureau = output['current']['bureau'];
    id = output['current']['public_id'];
    //budget = parseFloat(output['current']['budget_percent']);
    budget = parseFloat(output['current']['restrict_percent']);
    spendingBudget = parseFloat(output['current']['budget_dollar']);
 
    //remove if already exist 
    
    mainTitle = title
    var nestLevelText = ""
    if(currentNest == maxNest){
      nestLevelText = "Expenditures unested"
    }else{
      nestLevelText = "Expenditures specific to "+(maxNest-currentNest)+" level(s) above";
    }
  
    if(output['current']['is_medicare'] == "SS"){
      proportion = $("#ss_tax").val(); //will need to differentiate between medicare and social security spending
      allTax = 484482000000
    }else if( output['current']['is_medicare'] == "Medicare"){
      proportion = $("#medicare_tax").val(); //will need to differentiate between medicare and social security spending
      allTax = 778574000000
    }
    taxLevel = proportion;
    allTax = 3800000000000 //get better number here
   

    var currentShare = proportion * budget;

    divOut = ""
    
    if(makeNew != true){
      divOut = divOut+ '<div class="projectLevelWrap" id="'+id+'">';
    }
      divOut = divOut +  '<input type="hidden" class="maxValue" value="'+maxNest+'"/>'+
      '<input type="hidden" class="levelValue" value="'+currentNest+'"/>'+
      '<input type="hidden" class="budgetType" value="'+budgetType+'" />';
      divOut = divOut+'<div class="exit"><a class="closeProject" onClick="removeMe($(this))">X</a></div>'+
      '<div class="programDataMain">'+
      '<div class="programDataTopRow">'+
      '<div class="programBudget">Budget Tree: '+mainTitle+'<br>Annual Budget for 2012 ($): '+numberToWords(spendingBudget)+'<br>'+
      '<div class="miniDescription"></div>'
    
      if((makeNew != true && outputBig.length>1) || makeNew == "search"){
         divOut =  divOut+'<a class="seeGraphs">View More (Graphs)</a>'
      }else{
        divOut =  divOut+'<a class="seeGraphs">Hide</a>'
      }
      divOut = divOut +'</div>'+  // commaSeparateNumber(decimalRound(budget*allTax/1000000000))   //Budget (% of total): '+decimalRound(budget*100)+'% <br> 
      //'<br><p class="nestlevel">'+nestLevelText+'</p><div class="nestingSlider"></div></div>'+
      '<div class="userShare">'+
      '<table><tr><td>Your Current Share: </td><td><p>$'+commaSeparateNumber(decimalRound(currentShare))+'</p></td></tr>'+
      //'<br>Proposed Share of this Program: <span class="userTaxAmt"></span>'+
      '<tr><td>Tax Change After Your Proposal: </td><td> <p class="userTaxChangeDollar"></p></td></tr>'+
      '<tr><td>Change in US Budget: </td><td><p class="budgetChangePerc"></p></td></tr>'+
      '</table>'+
      '<br><h6>Drag to change this programs budget --></h6>'+
      '</div>'+
      
      '<div class="sliderWrap"><div class="slider"></div><p class="amount"></p></div>'+
      
      '</div>'+
      '<div class="programDataBottomRow">'+
      //turn this into a loop for all options
      '<div class="timelineWrapper">'+
      '<select class="changeGraphType" onchange = changeGraphType($(this),"'+id+'","'+currentNest+'","'+budgetType+'")>'+
      '<option value="line">Time Series</option>'
      if(graphType == "bar"){
        divOut = divOut + '<option value="bar" selected="selected">Bar graph</option>'
      }else{
        divOut = divOut+'<option value="bar">Bar graph</option>'
      }
       divOut = divOut+'</select>'+
      '<div class="programTimeline" id="timeline'+id+'">  </div>'+
      '<input type="radio" id="radioPercent'+id+'" name="graphType'+id+'" value="budget_percent" checked />% of Total Budget '+
      '<input type="radio" id="radioDollars'+id+'" name="graphType'+id+'" value="budget_dollar" />$(Millions)'+
      '</div>'+
      '<div class="timelineData">'
      
     
      if(maxNest > 1){
         divOut =  divOut+'<p class="nestLevel">'+nestLevelText+'</p><p class="sliderLabel"><a class="nestedSliderButton"><-- Less General</a>  <a class="nestedSliderButton"> More General--></a></p>'+
         '<div id="nestingSlider_'+id+'" class="nestingSlider"></div>'
      }

      divOut =  divOut+'<div id="timelineDat'+id+'"></div>'+
      '</div>'+
      '</div>'
      if(makeNew != true){
        divOut = divOut +'</div>'
      }
      
       divOut = divOut+'<input type="hidden" id="'+id+'CurrentShare" value='+currentShare+' />'+
      '<input type="hidden" id="'+id+'Budget" value='+budget+' />'
     
      
     

    
      if(makeNew != true){
        //$("#"+id).remove();
        $(".programsList").prepend(divOut);
        }
      else if(makeNew == true){
      
          $("#"+id).html(divOut);
          
        }   
      
  
  
    restrictedArray = output['timeline_restricted']
    graphArray = output['timeline'];
    titles = output['timeline_titles'];
    
  
    var type=""
   
    if(budgetType == "budget_dollar"){
      var type="dollars"
      $("#radioDollars"+id).attr("checked","checked");
      
      }else{
        var type="percent"
      }
    
    if(graphType == "line"){
      google.setOnLoadCallback(drawLineGraph(id,graphArray,titles,taxLevel,type,restrictedArray,output['current']['is_medicare']));
    }else{
      google.setOnLoadCallback(drawBarGraph(id,graphArray,titles,taxLevel,type,restrictedArray,output['timeline_ids']));

    }
   
    if((makeNew != true && outputBig.length>1) || makeNew == "search"){
      
      $(".programDataBottomRow").css("display","none");
    }
    $(".slider").slider({
      range: "min",
      value: 0,
      orientation: "vertical",
      min: -100,
      max: 100,
      slide: function(event, ui) {
        id = $(this).closest(".projectLevelWrap").attr("id");
        currentShare = parseFloat($(this).closest(".projectLevelWrap").find("#"+id+"CurrentShare").val());
        budget = parseFloat($(this).closest(".projectLevelWrap").find("#"+id+"Budget").val());
        $(this).next().text(ui.value+"%");
        
        
        $(this).closest(".projectLevelWrap").find(".userTaxChangeDollar").text("$"+commaSeparateNumber(decimalRound((taxLevel*budget*(1+(ui.value/100)))-(taxLevel*budget))));
        $(this).closest(".projectLevelWrap").find(".budgetChangePerc").text(decimalRound((((allTax*budget*(1+(ui.value/100)))/allTax)-budget)*100)+"%")
        
      }
    });
   
    if(maxNest > 1 ){

      $("#nestingSlider_"+id).slider({
        range: "min",
        value: currentNest,
        min: 1,
        max: maxNest,
        slide: function(event, ui) {
          
         
          levelValue = ui.value
          id = $(this).closest(".projectLevelWrap").attr("id");
          
          graphType = $(this).closest(".projectLevelWrap").find("option:selected").val()
          budgetType = $(this).closest(".projectLevelWrap").find(".budgetType").val()
          levelText = "Nesting Level: "+levelValue;
          
          findData(id,parseInt(levelValue),true,null,budgetType,graphType); //keep these from defaulting to percetn
  
        }
      });
    }
  }  

}


      

function fastNavigate(id){
 
  findData(id,1,false,null,"budget_percent","line");

}


function changeGraphType(e,id,nesting,budget_type){
  
  unique_id = id.match(/[0-9]*/);
  graph_type = e.find("option:selected").val()
  taxLevel = e.closest(".projectLevelWrap").find("#"+id+"CurrentShare").val()/e.closest(".projectLevelWrap").find("#"+id+"Budget").val()
  divToChange = e.parent().find(".programTimeline");
  
  $.ajax({
    type: 'GET',
    url: '/change_graph',
    data: {id: unique_id, nesting: nesting, graph_type: graph_type, budget_type: budget_type},
    success: function(output) {
      outputBig = JSON.parse(output);
      
      graphArray = outputBig['timeline']
      titles = outputBig['timeline_titles']
      
      if(graph_type == "bar"){
        timelineIds = outputBig['timeline_ids'];
        restrictedArray = outputBig['timeline_restricted']
        google.setOnLoadCallback(drawBarGraph(id,graphArray,titles,taxLevel,budget_type,restrictedArray,timelineIds));
      
      }else{
        medicare_ss = outputBig['is_medicare']
        restrictedArray = outputBig['timeline_restricted']
        google.setOnLoadCallback(drawLineGraph(id,graphArray,titles,taxLevel,budget_type,restrictedArray,medicare_ss));

      
      }
     
      
    }  
  });

}







