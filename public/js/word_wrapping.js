function fontSize(d,i) {

if(d3.event){
  scale = d3.event.scale;
}
scale = 1
var size = parseInt(d.radius)/5;
var words = d.name.split(' ');
var word = words[0];
var width = parseInt(d.radius)*.8;
var height = width/2;
var length = 0;
d3.select(this).style("font-size", size + "px").text(word);
while(((this.getBBox().width >= width) || (this.getBBox().height >= height)) && (size > (10/scale)))
 {
  size--;
  d3.select(this).style("font-size", size + "px");
  this.firstChild.name = word;
 }
 //alert(size)


}
 
function wordWrap(d, i){

var words = d.name.split(' ');

var line = new Array();
var length = 0;
var text = "";
var width = parseInt(d.radius)*.7;
var height = width;
var word;
do {
   word = words.shift();
   line.push(word);
   if (words.length)
     this.firstChild.name = line.join(' ') + " " + words[0];
     
   else
     this.firstChild.name = line.join(' ');
   length = this.getBBox().width;
   if (length < width && words.length) {
     ;
   }
   else {
     text = line.join(' ');

     this.firstChild.name = text;
     if (this.getBBox().width > width) { 
       text = d3.select(this).select(function() {return this.lastChild;}).text();
       text = text.replace(/\./g,""); 
       text = text + "...";
       
       d3.select(this).select(function() {return this.lastChild;}).text(text);
       d3.select(this).classed("wordwrapped", true);
       break;
    }
    else
      ;
 
  if (text != '') {
   
   /* d3.select(this).append("svg:tspan")
    .attr("x", 0)
    .attr("dx", "0.15em")
    .attr("dy", "0.9em")
    .text(text);*/
     d3.select(this)
    //.attr("x", 0)
    .text(text);
  }
  else
     ;
 
  if(this.getBBox().height > height && words.length) {
     text = d3.select(this).select(function() {return this.lastChild;}).text();
     text = text.replace(/\./g,""); 
     text = text + "...";
     d3.select(this).select(function() {return this.lastChild;}).text(text);
     d3.select(this).classed("wordwrapped", true);
 
     break;
  }
  else
     ;
 
  line = new Array();
    }
  } while (words.length);
  this.firstChild.name = '';
} 


