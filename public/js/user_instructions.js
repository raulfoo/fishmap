$(document).ready(function(){
  
  $(".selectContainers").mouseover(function(){
  
    $("#instructions").html("To filter search results, move options from the left to the right box by selecting and clicking the >> button. Then hit 'Change Selection'")
  
  })
  
   $(".selectContainers").mouseout(function(){
  
    $("#instructions").html("If you see a color, click on it. Find data sources at bottom of page.")
  
  })
  
  
  $(document).on("mouseover", "#totalsSummary a", function(){
    $("#instructions").html("Click to sort the national ranking  drop down based on "+ $(this).text())
  
  })
  
   $(document).on("mouseout", "#totalsSummary a", function(){
      $("#instructions").html("If you see a color, click on it. Find data sources at bottom of page.")
  
  })
  
  
  $(".countries").dblclick(function(){
   // alert("hello")
  
  })
  
  

  
  
});