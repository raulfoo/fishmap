function drawLegend(dat){
  output = "<div class='legendBoxDiv'><div class='newLine'><div class='floatLeft'>Exports/Destinations:</div>"
  qIndex = 
  
  negatives = temp= dat.filter(function(d) {return d.level_value <= 0})
  
  temp= dat.filter(function(d) {return d.level_value > 0}) 
  qIndex = negatives.length
  temp.forEach(function(e){
      output = output+"<div class='floatLeft'><div class='legendBox' title = '"+qIndex+"' style='background-color: "+e.color+"'></div><div> <="+ commaSeparateNumber(Math.round((e.level_value-.0001)*100)/100)  +"</div></div>"
      qIndex ++
  });
  
  output = output+"</div>"
  temp= dat.filter(function(d) {return d.level_value <= 0}) 
  if( temp.length > 0){
  output = output+"<div class='newLine'><div class='floatLeft'>Imports/Sources:</div>"
   temp= dat.filter(function(d) {return d.level_value <= 0}) 
  
   qIndex = 0
   negatives.forEach(function(e){
     
      output = output+"<div class='floatLeft'><div class='legendBox'  title = '"+qIndex+"' style='background-color: "+e.color+"'>\n</div><div> <="+ commaSeparateNumber(Math.round((e.level_value-.0001)*100)/100)  +"</div></div>"
      qIndex ++;
    });
    
    output = output+"</div>"
  }
  output = output+"</div>"
   
  $("#mapLegend").html(output)
  
}