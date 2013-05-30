
$(document).ready(function(){
  
  $("#btnRight").click(function () {
      var selectedItem = $("#rightValues option:selected");
      x = selectedItem
    
      newContent = sortListAlphabetical(x,"leftValues")
      $("#leftValues").html(newContent)
  });
  
  $("#btnLeft").click(function () {
      var selectedItem = $("#leftValues option:selected");
       x = selectedItem
     
      newContent = sortListAlphabetical(x,"rightValues")
      $("#rightValues").html(newContent)
  });
  
  $("#rightValues").change(function () {
      var selectedItem = $("#rightValues option:selected");
      //$("#txtRight").val(selectedItem.text());
  });

 $("#btnRightBottom").click(function () {
     var selectedItem = $("#rightValuesBottom option:selected");
     x = selectedItem
    
     newContent = sortListAmount(x,"leftValuesBottom")
     $("#leftValuesBottom").html(newContent)
  });
  
  $("#btnLeftBottom").click(function () {
     var selectedItem = $("#leftValuesBottom option:selected");
     x = selectedItem

     newContent = sortListAmount(x,"rightValuesBottom")
     $("#rightValuesBottom").html(newContent)
     
  });
  
  $("#rightValuesBottom").change(function () {
      var selectedItem = $("#rightValuesBottom option:selected");
      //$("#txtRight").val(selectedItem.text());
  });
  
 

});

function sortListAlphabetical(x,container){


  dat = []
    
  x.appendTo("#"+container)
   
  $("#"+container).val().forEach(function(d){
    dat.push(d)
  });
  
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


function buildRegionSelect(dat,current,category){

  $("#nationChooseText").html("<p>"+category+" details for: </p>")
  content = ""
  dat.sort(compare)
  dat.forEach(function(e) {
    if(e.region_id == current){
      content = content+'<option value="'+e.region_id+'" selected="selected">'+e.region_name+'</option>'
    }else{
      content = content+'<option value="'+e.region_id+'">'+e.region_name+'</option>'
    }
  });
  
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
  
  
  $("#nationDetailsChoose").html(content)
  $("#nationDetailsChooseYear").html(yearContent)
  
  


}