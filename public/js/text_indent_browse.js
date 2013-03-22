$(document).ready(function(){

var wTree = 600,
    hTree = 500,
    iTree = 0,
    barHeightTree = 20,
    barWidthTree = wTree * .8,
    durationTree = 400,
    rootTree;

var treeTree = d3.layout.tree()
    .size([hTree, 100]);

var diagonalTree = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var visTree = d3.select(".chartTree").append("svg:svg")
    .attr("width", wTree)
    .attr("height", hTree)
  .append("svg:g")
    .attr("transform", "translate(20,30)")
    

d3.json("json/treeIndentBrowse.json", function(jsonTree) {
  jsonTree.x0 = 0;
  jsonTree.y0 = 0;
  rootTree = jsonTree
  
  function collapseTree(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapseTree);
      d.children = null;
    }

  }
  
  rootTree.children.forEach(collapseTree)
  //collapse(root)
  updateTree(rootTree);
});

function updateTree(source) {
  // Compute the flattened node list. TODO use d3.layout.hierarchy.
  var nodesTree = treeTree.nodes(rootTree);
  //temp = nodes
  // Compute the "layout".
  nodesTree.forEach(function(n, i) {
    n.x = i * barHeightTree;
  });
  
    
  // Update the nodes…
  var nodeTree = visTree.selectAll("g.node")
      .data(nodesTree, function(d) { return d.id || (d.id = ++i); });
  
  var nodeEnterTree = nodeTree.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  nodeEnterTree.append("svg:rect")
      .attr("y", -barHeightTree / 2)
      .attr("height", barHeightTree)
      .attr("width", barWidthTree)
      .style("fill", colorTree)
      .on("click", clickTree);
  
  nodeEnterTree.append("svg:text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) { return d.name; });
  
  // Transition nodes to their new position.
  nodeEnterTree.transition()
      .duration(durationTree)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);
  
  nodeTree.transition()
      .duration(durationTree)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", colorTree);
  
  // Transition exiting nodes to the parent's new position.
  nodeTree.exit().transition()
      .duration(durationTree)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();
  
  // Update the links…
  var linkTree = visTree.selectAll("path.link")
      .data(treeTree.links(nodesTree), function(d) { return d.target.id; });
  
  // Enter any new links at the parent's previous position.
  linkTree.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonalTree({source: o, target: o});
      })
    .transition()
      .duration(durationTree)
      .attr("d", diagonalTree);
  
  // Transition links to their new position.
  linkTree.transition()
      .duration(durationTree)
      .attr("d", diagonalTree);
  
  // Transition exiting nodes to the parent's new position.
  linkTree.exit().transition()
      .duration(durationTree)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonalTree({source: o, target: o});
      })
      .remove();
  
  // Stash the old positions for transition.
  nodesTree.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function clickTree(d) {


  if(d.aggregate=="true" | d.level =="bureau"){
    findData(String(d.find_id),1,false,null,"budget_percent","line");
  }
  
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  updateTree(d);
}

function colorTree(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

$(".chartTree").scroll(function(){
    if($(this)[0].scrollHeight - $(this).scrollTop() <= $(this).outerHeight())
    {
    
     heightTree = $(".chartTree").select("svg:svg").children().eq(0).attr("height")
     if(($(".node").length * barHeightTree) > heightTree){
       heightTree = parseInt(heightTree)+150
       $(".chartTree").select("svg:svg").children().eq(0).attr("height",heightTree)
      
       updateTree(rootTree)
      }
    }
});

});
