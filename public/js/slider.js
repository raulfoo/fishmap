$(document).ready(function(){

$(function() {
    $( "#slider" ).slider({
      value: 2009,
      range: "min",
      min: 1981,
      max: 2010,
      step: 1,
      slide: function( event, ui ) {
        $("#amount").html("Selected: " + ui.value );
        $("#amountVal").val(ui.value);
      },
      change: function( event, ui ) {
        getData(arcs,$("#categoryHolder").val(),"true")
      }
    });
  });
  
  
  
});