var legendDat
function drawLegend(dat){
  function toScientific(number,sig){
    if(Math.abs(number)<1){
      var match = /[1-9]/.exec(number)
      roundPosition = match.index
      newNum = Math.round(Math.abs(number)*Math.pow(10,roundPosition-1))/Math.pow(10,roundPosition-1)
      if(number < 0) newNum = newNum*-1
      return newNum
    }
    if(Math.abs(number) < 1000) {
      return Math.round(number*100)/100
    }
    function sigFigs(n, sig) {
      multiplier = 1
      if(n<0){
        n = Math.abs(n)
        multiplier = -1
      }
      var mult = Math.pow(10,
          sig - Math.floor(Math.log(n) / Math.LN10) - 1);
      return multiplier*(Math.round(n * mult) / mult);
    }
    number = Math.round(sigFigs(number,sig))
    return number.toExponential()
  }
  //do legend in scientific notation
  output = "<div class='legendBoxDiv'>"
  qIndex = 
  legendDat = dat
  negatives = dat.filter(function(d) {return d.level_value <= 0})

  temp= dat.filter(function(d) {return d.level_value > 0}) 
  if( temp.length > 0){
    output = output+"<div class='newLine'><div class='floatLeft'>Exports/Destinations:</div>"
    qIndex = negatives.length
    temp.forEach(function(e){
        output = output+"<div class='floatLeft'><div class='legendBox' title = '"+qIndex+"' style='background-color: "+e.color+"'></div><div> <="+ toScientific(((e.level_value)*100)/100,3)  +"</div></div>"
        qIndex ++
    });
    
    output = output+"</div>"
  }
  temp= dat.filter(function(d) {return d.level_value <= 0}) 
  if( temp.length > 0){
  output = output+"<div class='newLine'><div class='floatLeft'>Imports/Sources:</div>"
   temp= dat.filter(function(d) {return d.level_value <= 0}) 
  
   qIndex = 0
   negatives.forEach(function(e){
     
      output = output+"<div class='floatLeft'><div class='legendBox'  title = '"+qIndex+"' style='background-color: "+e.color+"'>\n</div><div> <="+ toScientific(((e.level_value)*100)/100,3)  +"</div></div>"
      qIndex ++;
    });
    
    output = output+"</div>"
  }
  output = output+"</div>"
   
  $("#mapLegend").html(output)
  
}