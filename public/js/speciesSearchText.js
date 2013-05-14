function searchText(search){

  regExTest = new RegExp(".*"+search+".*","i")
  
  $("#leftValues option:selected").attr("selected",false)
  var values = $.map($("#leftValues").children() ,function(option) {
      return option.value;
  });
  
  matches = []
  
  values.forEach(function(d) { if(d.match(regExTest)){matches.push(d)}})
  
  var obj=$('#leftValues');
  for (var i in matches) {
    val = matches[i]
   
     obj.find('option[value="'+val+'"]').attr('selected',1);
  }
  $("#numMatches").html(matches.length +" matches")

}

var values = $.map($("#leftValues").children() ,function(option) {
    return option.value;
});