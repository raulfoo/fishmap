function drawLegend(dat){
  output = "<div class='legendBoxDiv'><table ><tr><td>Exports/Desintations: </td>"
  
  temp= dat.filter(function(d) {return d.level_value > 0}) 
  temp.forEach(function(e){
      output = output+"<td><span class='legendBox' style='background-color: "+e.color+"'></span><span> <="+ commaSeparateNumber(e.level_value)  +"</span></td>"
  });
  
  output = output+"</tr><tr><td>Imports/Sources: </td>"
   temp= dat.filter(function(d) {return d.level_value <= 0}) 

   temp.forEach(function(e){
     
      output = output+"<td><span class='legendBox' style='background-color: "+e.color+"'></span><span> <="+ commaSeparateNumber(e.level_value)  +"</span></td>"
    });
    
  output = output+"</tr></table></div>"
   
  $("#mapLegend").html(output)
  
}