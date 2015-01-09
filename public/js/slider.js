$(document).ready(function(){

$(function() {
    $( "#slider" ).slider({
      value: 2009,
      range: "min",
      min: 1981,
      max: 2009,
      step: 1,
      slide: function( event, ui ) {
       if(allowNavigate){
        $("#amount").html(ui.value );
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
      orientation: "horizontal",
      slide: function( event, ui ) {
       if(allowNavigate){
        //$("#amount").html("Selected: " + ui.value );
        //console.log(ui.value)
        $("#filterThreshold").val(ui.value);
        if(ui.value==0) displayText = "Show All Countries"
        if(ui.value<0) displayText = "Show Net Imports"
        if(ui.value>0) displayText = "Show Net Exporters"
        $("#slideFilterValue").text(displayText)
        //console.log($("#filterThreshold").val())
        }
      },
      change: function( event, ui ) {
      if($("#categoryHolder").val()=="Production" && ui.value<0){
         $("#slideFilterValue").text("No net negative producers")
      }else if(allowNavigate && event.originalEvent){
        //console.log("go")
         // console.log(ui.value)
        getData(arcs,$("#categoryHolder").val(),"true")
        }
      }
    });
  });
  
  
  
});