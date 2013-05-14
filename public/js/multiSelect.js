$(document).ready(function(){
  
  $("#btnRight").click(function () {
      var selectedItem = $("#rightValues option:selected");
      x = selectedItem
      //$("#leftValues").append(selectedItem);
      
      x.appendTo("#leftValues")
  });
  
  $("#btnLeft").click(function () {
      var selectedItem = $("#leftValues option:selected");
      //$("#rightValues").append(selectedItem);
       x = selectedItem
      
       x.appendTo("#rightValues")
  });
  
  $("#rightValues").change(function () {
      var selectedItem = $("#rightValues option:selected");
      //$("#txtRight").val(selectedItem.text());
  });
  
 

});



function buildMultiSelect(dat){
  content = ""
  
  dat.forEach(function(e) {
    content = content+'<option value="'+e+'">'+e+'</option>'
  });
  
  $("#leftValues").html(content)
  $("#rightValues").html("")



}


function buildRegionSelect(dat,current,category){

  $("#nationChooseText").html("<p>"+category+" details for: </p>")
  content = ""
  dat.forEach(function(e) {
    if(e.region_id == current){
      content = content+'<option value="'+e.region_id+'" selected="selected">'+e.region_name+'</option>'
    }else{
      content = content+'<option value="'+e.region_id+'">'+e.region_name+'</option>'
    }
  });
  
  
  $("#nationDetailsChoose").html(content)
  


}