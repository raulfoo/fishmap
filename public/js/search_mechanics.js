$(document).ready(function(){
 
  $("#searchProgram").keyup(function(e){
    data = $(this).val();
    
    
      if(e.keyCode == 13){ //if press enter
        
        getResult(data,null);
      } 

    
    if(data.length < 4){
       $(".govtProgramsWrapper").fadeIn();
      return
    }else if(e.keyCode != 13){
    //  alert("fadeOut");l
      $(".govtProgramsWrapper").hide();
      findSuggestions(data,"false");
    }
   
  $("#searchProgramEnter").click(function(){
    
    data = $("#searchProgram").val();
    getResult(data,null);
  
  });
    
  })

function delayHide(){
  
  $(".opaqueRow").hide();
  
} 

  $("#searchTable").children().mouseleave(function(){
     $(".opaqueRow").hide();
   
    //setTimeout(delayHide,50);
  });
  
  
        
});

function showDescription(e,go){
  
  data = e.text();
  div = e.closest(".programBudget");
  div = div.find(".miniDescription");
  //alert(data)
  
  if(go == 2){
     div.html("")
     return
  }
  
  $.ajax({
    type: 'GET',
    url: '/description_find',
    data: {input: data},
    success: function(res) {
      div.html(JSON.parse(res)['description']);
    
    }
  });
}



function findSuggestions(data,viewMore){

  $(".opaqueRow").css("visibility","visible");
  $.ajax({
        type: 'GET',
        url: '/search_suggest',
        data: {letters: data, full_search: viewMore},
        success: function(res) {
         if(viewMore == "true"){
          //alert("pause");
         
         }
         
         $("#searchTable").children().children().eq(0).nextAll().remove()
         $("#searchTable").append(res);
       

      }
    })

}



function getResult(data,search){
  
 
  
  if(data == "View More"){
     
     findSuggestions(search,"true")
     
    }else{
    $(".opaqueRow").hide();
    $(".govtProgramsWrapper").fadeIn();
   
  $.ajax({
      type: 'GET',
      url: '/search_find',
      data: {input: data},
      success: function(res) {
       //run the normal browse function with the unique_id provided
        bigOutput = JSON.parse(res);
        
        if(bigOutput['output'].length>0){
          clearAll(true);
          $("#searchProgram").val(bigOutput['original_search'])
          for(i = 0;i<bigOutput['output'].length;i++){
            
            output = bigOutput['output'][i];
            //level = output['level'];
            unique_id = output;
            
            
            findData(unique_id,1,"search",null,"budget_percent","line");
             
          } 
          }else{
            $("#searchProgram").val("No agency or program found of that name!");
          }
      }
      
    });
  }

}