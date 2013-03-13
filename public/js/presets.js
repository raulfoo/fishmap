$(document).ready(function(){
  setCookie('income',$("input[name=income]").val(),1) //save for 1 day
  if(getCookie('lastSelection')!=null){
    runExample(getCookie('lastSelection'));
  
  }else{
    //runExample("3000");
  
  }
  
  //$('#incomeForm').submit(function(){
    $("#stepOne").fadeOut();
    if(getCookie('lastSelection')==null){
      $("#stepTwo").fadeIn();
    }
  
});


function runExample(id){
  id = String(id);
  
  findData(id, 1,false,null,"budget_percent","line");
  
}