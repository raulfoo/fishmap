
$(document).ready(function(){
  
  $("#btnRight").click(function () {
      var selectedItem = $("#rightValues option:selected");
      x = selectedItem
      //alert("left")
      //console.log(x)
      if (x.length > 0){

      newContent = sortListAlphabetical(x,"leftValues")
      
      $("#leftValues").html(newContent)
      }
  });
  
  $("#btnLeft").click(function () {
      var selectedItem = $("#leftValues option:selected");
       x = selectedItem
      //  alert("right")
      //console.log(x)
      if (x.length > 0){

        newContent = sortListAlphabetical(x,"rightValues")
        $("#rightValues").html(newContent)
      }
  });
  
  $("#rightValues").change(function () {
      var selectedItem = $("#rightValues option:selected");
      //$("#txtRight").val(selectedItem.text());
  });

 $("#btnRightBottom").click(function () {
     var selectedItem = $("#rightValuesBottom option:selected");
     x = selectedItem

     if (x.length > 0){
      
       newContent = sortListAmount(x,"leftValuesBottom")
       $("#leftValuesBottom").html(newContent)
     }
  });
  
  $("#btnLeftBottom").click(function () {
     var selectedItem = $("#leftValuesBottom option:selected");
      x = selectedItem
     if (x.length > 0){
     

       newContent = sortListAmount(x,"rightValuesBottom")
       $("#rightValuesBottom").html(newContent)
     }
  });
  
  $("#rightValuesBottom").change(function () {
      var selectedItem = $("#rightValuesBottom option:selected");
      //$("#txtRight").val(selectedItem.text());
  });
  
 

});

function sortListAlphabetical(x,container){


  dat = []
    
  x.appendTo("#"+container)
  
  //console.log(x)
 
  /*$("#"+container).val().forEach(function(d){
    dat.push(d)
    console.log("chi")
  });*/
  
  $("#"+container+" option").each(function(){
    dat.push($(this).val())
    //console.log("chi")
  });
  //console.log(dat) 
  content=""
  dat.sort().forEach(function(e) {
    content = content+'<option value="'+e+'">'+e+'</option>'
  });
     
     return content

}


function sortListAmount(x,container){


  dat = []
  
  x.appendTo("#"+container)
  
  $("#"+container).children().each(function(){
    dat.push({id:$(this).val().split("||")[0], value:$(this).val().split("||")[1]})
  });
  
  content=""
  
  dat.sort(compare).forEach(function(e) {
    content = content+'<option value="'+e.id+'||'+ e.value+'"}>'+e.id+'</option>'

  });
     
     return content

}



function buildMultiSelect(dat){
  content = ""
  
  dat.forEach(function(e) {
    content = content+'<option value="'+e+'">'+e+'</option>'
  });
  
  $("#leftValues").html(content)
  $("#rightValues").html("")
  




}

function buildNationalMultiSelect(dat,sortType){
  content = ""
  
  if (sortType == "region"){
    select = "partner"
    }else{
    select = "description"
    }
  //dat.sort(compare)
  datTemp = dat.map(function(e) { return e[select]})
  
  datTemp = $.grep(datTemp, function(v, k){
    return $.inArray(v ,datTemp) === k;
  });
  
  newDat = []
  datTemp.forEach(function(e){
    value = 0
    dat.forEach(function(d){ if(d[select] == e) value+= d.value})
    newDat.push({id:e, value: value})
  })
  
  dat = newDat
  dat.sort(compare)
  
  content = ""
  dat.forEach(function(e) {
    /*content = content+"<option value='{"+
    '"id":'+e.id+', "amount":'+
    e.value+"}'>"+e.id+"</option>"*/
    
     content = content+'<option value="'+e.id+'||'+ e.value+'"}>'+e.id+'</option>'
  
  });
  
  
  $("#leftValuesBottom").html(content)
  $("#rightValuesBottom").html("")
  

}

$(document).on("click", "#totalsSummary a", function(){
  
  $("#regionSubset").val($(this).attr("title"))
  getRegionRanks($(this).attr("title"))
  /*$.ajax({
        type: 'POST',
        url: '/create_rank_list',
        data: {category: $("#categoryHolder").val(),species: speciesSel, year: $("#amountVal").val(), subset: $(this).attr("title")},
        success: function(output) {
          output = JSON.parse(output)
          
          buildRegionSelect(output,$("#regionHolder").val(),$("#categoryHolder").val()) 
          
          
          
          }
        });*/

})

function buildRegionSelect(dat,current,category){

  $("#nationChooseText").html("<p>"+$("#regionSubset").val()+" "+category+" for: </p>")
  content = ""
  dat.sort(compare)
  index = 1
  dat.forEach(function(e) {
    if(e.region_id == current){
      content = content+'<option value="'+e.region_id+'" selected="selected">'+e.region_name+' (Rank: '+index+')</option>'
    }else{
      content = content+'<option value="'+e.region_id+'">'+e.region_name+' (Rank: '+index+')</option>'
    }
    index++
  });
  if($("#changeGraphType").html() == "View Full Time Series"){
    yearContent = ""
    /*if( $("#categoryHolder").val() == "Fishmeal"){
        yearMax = Math.min(yearMax,2009)
        if($("#amountVal").val()==2010) $("#amountVal").val(2009)
      }
    */
   
    for(i=yearMin;i<=yearMax;i++){
      if(i ==$("#amountVal").val()){
        yearContent = yearContent+'<option value="'+i+'" selected="selected">'+i+'</option>'
      }else{
        yearContent = yearContent+'<option value="'+i+'">'+i+'</option>'
  
      }
    }
    
    
    $("#nationDetailsChooseYear").html(yearContent)
    $("#nationDetailsChooseYear").css("visibility","")
    
    }else{
     $("#nationDetailsChooseYear").css("visibility","hidden")
    }
    $("#nationDetailsChoose").html(content)

}

function getRegionRanks(subsetType){

 if($("#changeGraphType").attr("title")=="Year"){
  yearValue = "All"
 }else{
  yearValue =  $("#amountVal").val()
 }
 
 $.ajax({
    type: 'POST',
    url: '/create_rank_list',
    data: {category: $("#categoryHolder").val(),species: speciesSel, year: yearValue, subset: subsetType, per_capita: $("#radios :checked").val()},
    success: function(output) {
      output = JSON.parse(output)
      
      buildRegionSelect(output,$("#regionHolder").val(),$("#categoryHolder").val()) 
      
      
      
      }
    });
    
  }


