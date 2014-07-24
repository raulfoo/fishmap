$(document).ready(function(){

$(function() {
    $( "#slider" ).slider({
      value: 2009,
      range: "min",
      min: 1981,
      max: 2010,
      step: 1,
      slide: function( event, ui ) {
       if(allowNavigate){
        $("#amount").html("Selected: " + ui.value );
        $("#amountVal").val(ui.value);
        }
      },
      change: function( event, ui ) {
       if(allowNavigate){
        getData(arcs,$("#categoryHolder").val(),"true")
        }
      }
    });
  });
  
  
  $(function() {
    $( "#slider_value_filter").slider({
      value: 0,
      range: "min",
      min: -10,
      max: 10,
      step: 1,
      orientation: "vertical",
      slide: function( event, ui ) {
       if(allowNavigate){
        //$("#amount").html("Selected: " + ui.value );
        console.log(ui.value)
        $("#filterThreshold").val(ui.value);
        console.log($("#filterThreshold").val())
        }
      },
      change: function( event, ui ) {
       if(allowNavigate){
        console.log("go")
          console.log(ui.value)
        getData(arcs,$("#categoryHolder").val(),"true")
        }
      }
    });
  });
  
  
  
});