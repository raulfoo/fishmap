$(document).ready(function(){

var w = 900,
    h = 700,
    node,
    link,
    root,
    textLabel,
    allNodes,
    nodeEnter,
    plainJSONChildren,
    scale=1,
    displayCountForce,
    subfunctionLevelMin =1,
    subfunctionLevelMax = 10,
    duration = 750;
    
var trans=[0,0]

var textHeight = .8,
    textWidth = 1.6,
    moveLeft = textWidth/2,
    moveUp = textHeight/4;

var force = d3.layout.force()
    .on("tick", tick)
    .size([w, h])
    .gravity(1)
    .linkDistance(150)
    .charge(-1000)
    .friction(.3);
    
var zoom = d3.behavior.zoom()
  .scaleExtent([1, 8])
  .on("zoom", move);


var vis = d3.select(".chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .call(zoom)
    .append("g");
//zoomDiv = vis.append("g")

var plainJSONChildren


function start(){
  d3.json("json/subfunctionBubble.json", function(json) {
 
  
  root = json;
  mainRoot = root;
  plainJSONChildren = $.extend(true, [], root);
  

 
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d.placeHold = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }

  }

  collapse(root);
  collapse(plainJSONChildren);
  plainJSONChildren = plainJSONChildren._children

  startLen = root._children.length
  root._children.splice(0,(subfunctionLevelMin-1))
  root._children.splice((subfunctionLevelMax-1),(startLen-subfunctionLevelMax))
  $(".bubbleNavigateSearch").fadeIn();
  update(null);
  
  
  });
}

x = setTimeout(start,1000);

function update(parentString,endId,extend,endLevel,endRadius) {
  var nodes,
    lastRadius = parseInt(endRadius)
    
    if(lastRadius == null) lastRadius = 150
  
  if(parentString == null || parentString == "top"){
    
    nodes = flatten(root);

   
  }else{
    collapse(root)
    nodes = parentTree(root,parentString,endId,extend,endLevel);
    
  }
  var links = d3.layout.tree().links(nodes);
 
  // Restart the force layout.
  //temp = links
  if(parentString == null){
  force
      .nodes(nodes)
      .links(links)
      .linkDistance(function(d,i) {return (150+((1+Math.random())*(150)));})
      .gravity(1)
      .charge(0)
      .on("tick",tick)
      .start()
   
     }else{
      
        force
        .nodes(nodes)
        .links(links)
        .gravity(0)
        .charge(-500)
        .linkDistance(function(d,i) {return (100+(((1+Math.random()*2))*(lastRadius)));})
        .linkStrength(.5)
        .start()
        .on("tick",tick)
     }
  
   link = vis.selectAll("line.link")
      .data(links, function(d) { return d.target.id; });

  
  // Enter any new links.
 
  link.enter().insert("svg:line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
  
  // Exit any old links.
  link.exit().remove();

    
  // Update the nodes…
  node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id; })
   
    
  nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
      .on ("mouseover",mover)
      .on ("mouseout",mout)
   
  
  // Enter any new nodes.
  nodeEnter.append("svg:circle")
      .attr("r", function(d) { return d.radius })
      .style("fill",color)
      .style("stroke", function(d) { return "black"; })
      .style("stroke-width", 1.5)
      .on("click", click)
      .call(force.drag);
  
 
  vis.selectAll("circle")
    .style("fill", color);
    
    
  nodeEnter.append("svg:text")
     .attr("text-anchor","middle")
     .each(fontSize)
     .each(wordWrap)
  

  nodeEnter.append("svg:title")
    .style("text-anchor", "middle")
    .style("fill", "black")
    .text(5);
 

  // Exit any old nodes..transition()
      
  node.exit().remove();

  
}







function tick() {
  
  link.attr("x1", function(d) { return d.source.x; })
     .attr("y1", function(d) { return d.source.y; })
     .attr("x2", function(d) { return d.target.x; })
     .attr("y2", function(d) { return d.target.y; });
  
//ease("elastic",1,20)
    node.transition().ease("elastic",3,200).attr('transform', function (d, i) { 
        r = d.radius
        return 'translate(' + Math.max(r, Math.min(w - r, d.x)) + ',' + Math.max(r, Math.min(h - r, d.y)) + ') '
    })

}


// Color leaf nodes orange, and packages white or blue.
function color(d) {
  if(d.level == "top"){
    return d.children ? "#336633" : "#66CC00";
    }
  else if(d.level == "subfunction"){
      return d.children ? "#3182bd" : "#c6dbef";
     
  }else if(d.level == "agency"){
     return d.children ? "#D14719" : "#D65C33";
  }else if(d.level == "bureau"){

    return "#A3A3C2";
  }
}


function changeRevealAmt(){

  root.children =  $.extend(true, [], plainJSONChildren) //arrange plainJSONChildren such that is in ascending order, find the first that isn't big enough, slice through to the last that isnt big enough, no need to loop here
  /*function addRemove(d){
    if(d.id < subfunctionLevel){
      root.children.shift()
    }
    count++
  }
  root.children.forEach(addRemove)*/
  startLen = root.children.length
  alert(subfunctionLevelMin)
  alert(subfunctionLevelMax)
  alert(startLen)
  root.children.splice((subfunctionLevelMax-1),(startLen-subfunctionLevelMax))
  root.children.splice(0,(subfunctionLevelMin-1))
  root.children.splice((subfunctionLevelMax-1),(startLen-subfunctionLevelMax))
 
  
  update("top",null,null,null,90)


}


// Toggle children on click.
function click(d) {

 if(d.level != "top" && d.level != "bureau"){
      $(".bubbleNavigateSearch").val(d.find_id)
      $("#bubbleText").html("Click to view<br><a>"+ d.name+"</a>")
      $("#subfunctionSlider").fadeOut();
    }else if(d.level == "bureau"){
      goToNavigate(d.find_id)
  
    }else if(d.level == "top" && d._children){
      $(".bubbleNavigateSearch").val(0)
      $("#bubbleText").html("The 10 largest government function are shown. Use the slider to modify your selection")
      $("#subfunctionSlider").fadeIn();
  }else{
    //$(".bubbleNavigateSearch").html("Click each bubble node to navigate through the agency hiearchy.")
     $("#bubbleText").html("Click each bubble node to navigate through the agency hiearchy.")
     $("#subfunctionSlider").fadeOut();
  }
  
  if(d.level != "top"){
    
    if (d._children) {
      expand="true"
      d.fixed=true;
    } else {
      expand="false"
      d.fixed=0;
    }
  
    update(d.parents,d.id,expand,d.level,d.radius);
    
    }else{
    
    root.fixed=true;
    root.px = 500;
    root.py = 250;
    //collapse(root)
    if (d.children) {
      collapse(root) 
    } else {
      d.children = d.placeHold;
      d._children = null;
      
    }
    update("top",null,null,null,d.radius);
    }
  
}

function flatten(root) {
 
 root.fixed=true;
 root.px = 500;
 root.py = 250;
 var nodes = [], i = 0;
 randomChoose = []
 removeIndices = []

  function recurse(node) {
    if(node.level != "top"){
      node.fixed = 0;
      }
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
  
    nodes.push(node); 
  }


  recurse(root);
  
  return nodes
}

function parentTree(root,parents,endId,extend,endLevel) {
 
 var nodes = [], i = 0;
 //find the _children element in root that is a parent of clicked object and move that to children, repeat until reach child element id that was clicked convert all _children to children
 if(parents) {
   
    parents = parents.split(",")
  }
  levelArray = ["top","subfunction","agency","bureau","program"]
  levelThreshold = levelArray.indexOf(endLevel)
  
  function recurse(node) {
    node.fixed = 0;
    
    switch (node.level){
      case "top":
        if(levelThreshold >= 0){
          node.fixed=true;
          node.px = 100;
          node.py = 400;
          node.x = 100;
          node.y = 400;
        }
        break
      case "subfunction":
        if(levelThreshold > 1){
          node.fixed=true;
          node.px = 300;
          node.py = 300;
        
        }else if(levelThreshold == 1){
          node.fixed=true;
          node.px = 450;
          node.py = 250;

        }
        break
      case "agency":
         if(levelThreshold >= 2){
          node.fixed=true;
          node.px = 450;
          node.py = 250;
        }
        break
       
    }

    if(parents){
      
     
      tempChild = node._children
      if(tempChild){
      temp3 = tempChild
      for(j=0; j<tempChild.length;j++){
          if(parents.indexOf(String(tempChild[j].id)) > -1){
              node.children = [node._children[j]];
              node._children = null;
          }
      }
     
      temp2 = node
    }
    if(node.id == endId){    
      if(extend=="true"){
          node.children = node.placeHold;
          node._children = null;
        }else{
          node._children = node.placeHold;
          node.children = null;
        }
      }     
    }
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    
    
    nodes.push(node);
 
  }
  
  recurse(root);
  return nodes
}


function collapse(d) {
 
    if (d.children) {
      d._children = d.placeHold;
      d._children.forEach(collapse);
      d.children = null;
    }
    
  }



function move() {
    var t = d3.event.translate,
        s = d3.event.scale;
        scale = d3.event.scale
        trans = d3.event.translate
 
    t[0] = Math.min(w / 2 * (s - 1), Math.max(w / 2 * (1 - s), t[0]));
    t[1] = Math.min(h / 2 * (s - 1) + 230 * s, Math.max(h / 2 * (1 - s) - 230 * s, t[1]));
    zoom.translate(t);
    vis.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
    tempNode = vis.selectAll(".node");
    
    tempNode.select("text")
      .style("text-anchor", "middle")
      .style("font-size",12/(Math.pow(s,0.5)))
      .each(fontSize)
      .each(wordWrap)
  } 

    
function mover(d) {
        $("#pop-up").fadeOut(100,function () {
            // Popup content
            if(scale == null){
              scale = 1
              }
            displayLevel = d.level.toUpperCase();
            if(d.placeHold){
              childElements = d.placeHold.length+" child elements"
            }else{
               childElements = ""
            }
            if (d.level == "top") displayLevel = ""
            $("#pop-up-title").html(d.name);
            $("#pop-img").html(displayLevel);
            $("#pop-desc").html(childElements);

            // Popup position
           
            var popLeft = (d.x*scale)+trans[0]+50;//lE.cL[0] + 20;
            var popTop = (d.y*scale)+trans[1]+50;//lE.cL[1] + 70;
                     
            $("#pop-up").css({"left":popLeft,"top":popTop});
            $("#pop-up").fadeIn(100);
        });

    }

function mout(d) {
    $("#pop-up").fadeOut(50);
    //d3.select(this).attr("fill","url(#ten1)");
}


function goToNavigate(id){
  
  findData(String(id),1,false,null,"budget_percent","line");
  $("#tabs").fadeOut();
  $("#hideBrowsing").text("Show Browsing")
}

$(".bubbleNavigateSearch").click(function(){
  if($(this).val()!=0){
    findData(String($(this).val()),1,false,null,"budget_percent","line");
    $("#tabs").fadeOut();
    $("#hideBrowsing").text("Show Browsing")
  }
});


$("#subfunctionSlider").slider({
    range: true,
    value: 10,
    orientation: "horizontal",
    min: 0,
    max: 77,
    values: [1,10],
    change: function(event, ui) { 
      subfunctionLevelMin = ui.values[0]
      subfunctionLevelMax = ui.values[1]
      changeRevealAmt()   
    }
  });

});
