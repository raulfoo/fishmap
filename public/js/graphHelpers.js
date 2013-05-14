function categorySelect(data,sortType){

  if(sortType == "region") {
    uniqueFish = []
    
    data.forEach(function(x) {
      uniqueFish.push(x.description)
    });
    
    uniqueFish = $.grep(uniqueFish, function(v, k){
        return $.inArray(v ,uniqueFish) === k;
    });
    
    partners = []
    data.forEach(function(x) {
      partners.push(x.partner)
    
    });
    
     partners = $.grep(partners, function(v, k){
        return $.inArray(v ,partners) === k;
    });
    
    firstSelect = "partner"
    secondSelect = "description"
  }else{
  
    uniqueFish = []
    data.forEach(function(x) {
      uniqueFish.push(x.partner)
    });
    
    uniqueFish = $.grep(uniqueFish, function(v, k){
        return $.inArray(v ,uniqueFish) === k;
    });
    
    partners = []
    data.forEach(function(x) {
      partners.push(x.description)
    
    });
    
     partners = $.grep(partners, function(v, k){
        return $.inArray(v ,partners) === k;
    });
    firstSelect = "description"
    secondSelect = "partner"
  
  }
  return {"firstSelect":firstSelect, "secondSelect":secondSelect, "partners" : partners, "uniqueFish":uniqueFish}
}
  
  

function createRanks(output,startPoint){

  rankingArray = []
  for(i = 0; i< output.length; i++){
      tempSum = 0
    
      uniqueFish.forEach(function(key){
       if(key != "State"){
        tempSum  += parseFloat(output[i][key])
       }
       
     });
     rankingArray.push(tempSum)
  }
  
  sortedVals = rankingArray.slice()
  sortedVals.sort(function(a,b){ return b-a});



newRanks = []
$.each(rankingArray, function(idx, item) {
    var rank= $.inArray( item, sortedVals)+1;/* index position and add one for 1st,second etc*/
    newRanks.push(rank)  
})

  selectIndices = []
  for(i=1;i<=10;i++){
    selectIndices.push(newRanks.indexOf(i))
  }
  
  temp = selectIndices.filter(function(d){ return d >= 0})
  newOut = []
  temp.forEach(function(d){
    newOut.push(output[d])
  })
  
  outputCapture = []
  
  aggregates = $.grep(newOut, function(e){return e.State == "Other, aggregated"})[0]
  locationIndex =  newOut.indexOf(aggregates)

  if(locationIndex > -1){
     newOut.splice(locationIndex,1)
     newOut.push(aggregates)
  }
  
  outputCapture = newOut
  
  
  return outputCapture

}

   
function mouseoverFunc(d,i,data,switchSort){
  if(switchSort == "region"){
      select1 = "partner"
       select2 = "description"
    }else{
       select1 = "description"
       select2 = "partner"
    }

  
  workDat = data.filter(function(e) { return e[select1] == d.name && e[select2] == d.column});
  workDat = workDat[0]
  

  var popLeft = (d3.event.pageX+50);
  var popTop = (d3.event.pageY-125);

  popUpText = "<div class='popUpText'><p>Selection: "+workDat[select1] +"</p><p>Value: "+workDat.value+"</p>"
  popUpText = popUpText+"<table class='popUpTable'>"+
   
    "<tr><td>"+workDat[select1]+" share of total "+workDat.region_name+" production </td><td>"+workDat.percent_constrained+"</td></tr>"
  if(workDat.percent_all<=100 && switchSort == "species"){
    popUpText=popUpText+"<tr><td>"+workDat.region_name +" share of global "+workDat[select1]+" production </td><td>"+workDat.percent_all+"</td></tr>"
  }
  
  popUpText =  popUpText+"</table></div>"
    
  $("#pop-up").fadeOut(100,function () {
 
    $("#pop-desc").html(popUpText);

    $("#pop-up").css({"left":popLeft,"top":popTop});
    $("#pop-up").fadeIn(100);
  });

}

function mout(d) {
  $("#pop-up").fadeOut(50);
}

function chooseTradeType(d){
  if(d.tradeType=="Import"){
    return 1    
  }else{
    return 0
    }
}
