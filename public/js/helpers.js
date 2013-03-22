function commaSeparateNumber(val){
  value = val.toString();
  value = value.split(".")
  val = value[0]
  
  if(value.length == 2){
    decimal =  value[1];
  }else{
    decimal = 0;
  }
  
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val+"."+decimal;
}


function decimalRound(val){
  precision = 2;
  if(Math.abs(val) > 1){
    precision = 2;
  }else{
    factor = 10;
    precision_increase = 1;
    while(true){
      temp = Math.abs(val)*Math.pow(factor,precision_increase)
      if(temp>1){
        break;
      }else{
        precision_increase++;
      
      }
      //fail safe
      if(precision_increase > 10){
        break;
      }
    
    }
    precision = precision + precision_increase;
  }
  newNum = Math.round(val*Math.pow(10,precision))/Math.pow(10,precision)
  return newNum


}


function numberToWords(val){
  changeCoeff = 1
  if(val < 0){
    changeCoeff = -1
  }
  val = Math.round(Math.abs(val));
  numberToWordsOut = val;
  if(val>=1000 && val < 1000000){
    numberToWordsOut = Math.round(val/1000)*changeCoeff + " Thousand";   
    
    }
  else if(val >=1000000 && val < 1000000000){
    numberToWordsOut = Math.round(val/1000000)*changeCoeff + " Million";
  }
  else if(val >= 1000000000){
    numberToWordsOut = Math.round(val/1000000000)*changeCoeff + " Billion";
  
  }
 
  return numberToWordsOut;
}