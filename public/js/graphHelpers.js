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
    
    output = chooseTopTen(data,uniqueFish,partners,firstSelect,secondSelect)
    uniqueFish = output[1]
    partners = output[0]
  
  
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
    
    
    output = chooseTopTen(data,uniqueFish,partners,firstSelect,secondSelect)

    uniqueFish = output[1]
    partners = output[0]
  
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
      select3 = "partner_percent"
    }else{
       select1 = "description"
       select2 = "partner"
       select3 = "type_percent"
    }
  
 
  if(data[0].category=="Trade"){
    workDat = data.filter(function(e) { return e[select1] == d.name && e[select2] == d.column && e.subset == d.tradeType && e['year'] == d.date});
  }else{
    workDat = data.filter(function(e) { return e[select1] == d.name && e[select2] == d.column && e['year'] == d.date});

  }
  workDat = workDat[0]
  

  var popLeft = (d3.event.pageX+50);
  var popTop = (d3.event.pageY-125);

  
   popUpText = "<div class='popUpText'><p>Selection: "+workDat[select1] +" --> "+workDat[select2]+"</p><p>Value: "+workDat.value+"</p>"+
  "<table class='popUpTable'>"
  if(workDat.category == "Production"){
    popUpText = popUpText+"<tr><td>% share of total "+workDat.region_name+" "+workDat.subset+" "+workDat.category+"</td><td>"+workDat.region_percent+"</td></tr>"
  }else{
      popUpText = popUpText+"<tr><td>% share of total "+workDat.region_name+" "+workDat.category+"</td><td>"+workDat.region_percent+"</td></tr>"

  }
  popUpText = popUpText + "<tr><td>% share of global "+workDat[select1]+"</td><td>"+workDat[select3]+"</td></tr>"+
  "</table></div>"
    
  $("#pop-up").fadeOut(0,function () {
 
    $("#pop-desc").html(popUpText);

    $("#pop-up").css({"left":popLeft,"top":popTop});
    $("#pop-up").fadeIn(0);
  });

}

function mout(d) {
  $("#pop-up").fadeOut(0);
}

function chooseTradeType(d){
  if(d.tradeType=="Import"){
    return 1    
  }else{
    return 0
    }
}

function compare(a,b){
    if (a.value < b.value) return 1
    if (a.value > b.value) return -1
  
  }
  
function compareYear(a,b){
  if (a.year > b.year) return 1
  if (a.year < b.year) return -1

}
  
  
function chooseTopTen(data,uniqueFish,partners,firstSelect,secondSelect){
    compareFish =[]
    uniqueFish.forEach(function(e){
      total = 0
      data.filter(function(d) {
        
        if(d[secondSelect] == e){
          total += d.value
        }
        
      });
      compareFish.push({id: e, value: total})
      
    
    
    });
    
    compareFish.sort(compare)
    uniqueFish = compareFish.slice(0,Math.min(9,compareFish.length))
    uniqueFish = uniqueFish.map(function(e){ return e.id});
    
    
    comparePartner =[]
    partners.forEach(function(e){
      total = 0
      data.filter(function(d) {
        
        if(d[firstSelect] == e){
          total += d.value
        }
        
      });
      comparePartner.push({id: e, value: total})
      
    
    
    });
    
    comparePartner.sort(compare)
    uniquePartner = comparePartner.slice(0,Math.min(9,comparePartner.length))  //could pass parameters to change domain range/position for this as well
    uniquePartner = uniquePartner.map(function(e){ return e.id});

    return [uniquePartner,uniqueFish]

}
    
    