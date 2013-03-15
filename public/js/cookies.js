function loadCookies(){
  
  if(getCookie("navigation") != null) {
     $('#sidebar').fadeIn();
     //$('#navigationWrapper').fadeIn();
     $('#navigationWrapper').html(getCookie("navigation"));
     
  }

 
  if($('input[name=income]').val() != "$" && $("#federalTaxes").val() == null){

    $('#incomeForm').submit();
  }else if($('input[name=income]').val() == "$"){
    
     $('#stepOne').fadeIn();
  }
 
}
 

function setCookie(c_name,value,exdays){

  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=value + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());

  document.cookie=c_name + "=" + c_value;
 
}

function getCookie(c_name){

  var i,x,y,ARRcookies=document.cookie.split(';');

  if(ARRcookies.length <=1){
    return null;
  }
  else{
   
    for (i=0;i<ARRcookies.length;i++){
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
     
      if (x==c_name){
        return unescape(y);
      }
    }
   } 
}