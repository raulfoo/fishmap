require "json"

class FishMap < Sinatra::Base

  get "/change_map" do
    
    
    
    category = params[:id]
    species_select = params[:species]
    
    puts species_select
    
    if species_select != "All"
      map_select = Splash.filter(:category =>  category, :description => species_select).select_group{[region_id, region_name]}.select_append{sum(value).as(value)}.order(:region_name).all.uniq

    else
      map_select = Splash.filter(:category =>  category).select_group{[region_id, region_name]}.select_append{sum(value).as(value)}.order(:region_name).all.uniq

    end
    
    map_select.map! {|e| e.values}
    
    detail_species = Splash.filter(:category =>  category).select(:description).order(:description).all.uniq
    detail_species = detail_species.map!{|e| e.description}
 
 
    
    thresholdDat = map_select.map{|e| e[:value]}
    thresholds = createThresholds(thresholdDat)
    
    if species_select != "All"
      connections = Connection.filter(:category =>  category, :description => species_select).select_group{[region_id, region_name, partner_id, partner_name]}.select_append{sum(value).as(value)}.all.uniq

    else
      connections = Connection.filter(:category =>  category).select_group{[region_id, region_name, partner_id, partner_name]}.select_append{sum(value).as(value)}.all.uniq
    end
    connections.map! {|e| e.values}
    
    
    if species_select != "All"
      details = Detail.filter(:category =>  category, :description => species_select).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    else
      details = Detail.filter(:category =>  category).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    end
    
    details.map! {|e| e.values}
    
    #detail_species = details.map{|e| e[:description]}.uniq.sort
    
    
    unique_region = Connection.filter(:category => category).select(:region_id).order(:region_id).all.uniq
    unique_region.map!{|e| e.region_id}
    
    
    
    
    
    associationArray = createAssociations(category,species_select)
    
    
    

    output = {:map_values => map_select, :thresholds => thresholds, :connections => connections, :details=> details, :nationIds => unique_region, :speciesOptions => detail_species, :assocArray => associationArray}
    
    return output.to_json
  
  end
  
  
  get "/create_associations" do
  
    connections = Connection.filter(:category => "Fishmeal").select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.all.uniq
    
    connections.map! {|e| e.values}
    
    centroids = Centroid.all
    centroids.map! {|e| e.values}
    
    fishmeal = connections.select{|e| e[:category] == "Fishmeal"}
    unique_regions = fishmeal.map{|e| e[:region_id]}.uniq
    #select all instances
    maxFishmeal = 0
    fishmealArray = Hash.new()
    unique_regions.each do |e|
      tempArray = Array.new()
      selects = fishmeal.select{|d| d[:region_id] == e}
      selects.each do |z|
        source = centroids.find{|a| a[:id] == z[:region_id]}
        target = centroids.find{|a| a[:id] == z[:partner_id]}
        
        
        if source == nil || target == nil
          next
        end
        
        if z[:value].abs > maxFishmeal
          maxFishmeal = z[:value].abs
        end
        
        tempArray.push({:source => [source[:x_coord],source[:y_coord]], :target => [target[:x_coord],target[:y_coord]], :value => z[:value],  :partner => z[:partner_name]})
      
      end
      fishmealArray[e.to_sym] = tempArray
    end
    
    connections = Connection.filter(:category => "Trade").select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.all.uniq


    trade = connections.select{|e| e[:category] == "Trade"}
    unique_regions = trade.map{|e| e[:region_id]}.uniq
    #select all instances
    maxTrade = 0
    tradeArray = Hash.new()
    unique_regions.each do |e|
      tempArray = Array.new()
      selects = trade.select{|d| d[:region_id] == e}
      selects.each do |z|
        source = centroids.find{|a| a[:id] == z[:region_id]}
        target = centroids.find{|a| a[:id] == z[:partner_id]}
        
        if source == nil || target == nil
          next
        end
        
        if z[:value].abs > maxTrade
          maxTrade = z[:value].abs
        end
        
        tempArray.push({:source => [source[:x_coord],source[:y_coord]], :target => [target[:x_coord],target[:y_coord]], :value => z[:value],  :partner => z[:partner_name]})
      end
       tradeArray[e.to_sym] = tempArray
    end
    
    
    connections = Connection.filter(:category => "Production").select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.all.uniq


    production = connections.select{|e| e[:category] == "Production"}
    unique_regions = production.map{|e| e[:region_id]}.uniq
    #select all instances
    maxProduction = 0
    productionArray = Hash.new()
    unique_regions.each do |e|
      tempArray = Array.new()
      selects = production.select{|d| d[:region_id] == e}
      selects.each do |z|
        source = centroids.find{|a| a[:id] == z[:region_id]}
        target = centroids.find{|a| a[:id] == z[:partner_id]}
        
        
        if source == nil || target == nil
          next
        end
        
        if z[:value].abs >  maxProduction
          maxProduction = z[:value].abs
        end 
        
        
        tempArray.push({:source => [source[:x_coord],source[:y_coord]], :target => [target[:x_coord],target[:y_coord]], :value => z[:value], :partner => z[:partner_name]})
      
      end
      productionArray[e.to_sym] = tempArray
    end
    
    fishmealArray = {:data => fishmealArray, :max => maxFishmeal}
    tradeArray = {:data => tradeArray, :max => maxTrade}

    productionArray  = {:data => productionArray, :max => maxProduction}
    
    
    output = {:Fishmeal => fishmealArray, :Trade => tradeArray, :Production => productionArray}
    return output.to_json
    
  
  end
  
  
  def createThresholds(data)
    
    raw_reds = ["#67000D","#A50F15","#CB181D", "#EF3B2C","#FB6A4A","#FC9272","#FCBBA1","#FEE0D2","#FFF5F0"]
    raw_blues = ["#F7FBFF", "#DEEBF7", "#C6DBEF", "#9ECAE1", "#6BAED6", "#4292C6", "#2171B5", "#08519C", "#08306B"]
    reds = []
    blues = []
    
    data = data.sort
    
    p data
    

    splits = 8
    num_negatives = 0
    num_negatives = data.index{|e| e>0}
    
    neg_data = data.select{|e| e<0}
    pos_data = data.select{|e| e>=0}
    num_neg_groups = 0
    neg_group_size = (num_negatives/splits).floor
    if neg_group_size > 0
      num_neg_groups = (num_negatives/neg_group_size).ceil
      neg_splits = num_neg_groups-1
      
      if num_neg_groups > 2
        selects = [0,8]
        shiftUp = ((7 % (num_neg_groups-2))/2).floor
        (1..(num_neg_groups-2)).each do |z|
          temp = shiftUp+z*((7/(num_neg_groups-2)).floor)
          selects.push(temp)
        end
      
        
        selects = selects.sort
        selects.each do |d|
          reds.push(raw_reds.slice(d))
        
        end
      end
    end
      
    
  
    num_pos_groups = [9-num_neg_groups,3].max
    pos_group_size = (pos_data.size/num_pos_groups).floor
    pos_splits = num_pos_groups
    
    if num_pos_groups > 2
      selects = [0,8]
      shiftUp = ((7 % (num_pos_groups-2))/2).ceil
      (1..(num_pos_groups-2)).each do |z|
        temp = shiftUp+z*((7/(num_pos_groups-2)).floor)
        selects.push(temp)
      end
    
      selects = selects.sort
      selects.each do |d|
        blues.push(raw_blues.slice(d))
      
      end
    end
    
    
   
    
    
    
    outArray = Array.new()
    
   
    if(neg_data.size > 0)
      (1..(neg_splits)).each do |step|
        if step < (neg_splits)
          temp_threshold = neg_data[step*neg_group_size]
        else
          temp_threshold = neg_data.last
        end
        if temp_threshold < 0 
          temp_color = reds.shift
        else
          temp_color = blues.shift
        end
        outArray.push({:color => temp_color, :level_value => temp_threshold})
      
        
      end
    end
    
    (1..(pos_splits)).each do |step|
      if step < (pos_splits)
        temp_threshold = pos_data[step*pos_group_size]
      else
        temp_threshold = pos_data.last + 100
      end
      if temp_threshold < 0 
        temp_color = reds.shift
      else
        temp_color = blues.shift
      end
      outArray.push({:color => temp_color, :level_value => temp_threshold})
    
      
    end
   
    
    return outArray
  
  end
  
  
  def createAssociations(cate,species)
    p species
    if species == "All"
      connections = Connection.filter(:category => cate).select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.all.uniq
    else
      connections = Connection.filter(:category => cate, :description => species).select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.all.uniq
    end
    
    connections.map! {|e| e.values}
    
    centroids = Centroid.all
    centroids.map! {|e| e.values}
    
    fishmeal = connections.select{|e| e[:category] == cate}
    unique_regions = fishmeal.map{|e| e[:region_id]}.uniq
    #select all instances
    maxFishmeal = 0
    fishmealArray = Hash.new()
    unique_regions.each do |e|
      tempArray = Array.new()
      selects = fishmeal.select{|d| d[:region_id] == e}
      selects.each do |z|
        source = centroids.find{|a| a[:id] == z[:region_id]}
        target = centroids.find{|a| a[:id] == z[:partner_id]}
        
        
        if source == nil || target == nil
          next
        end
        
        if z[:value].abs > maxFishmeal
          maxFishmeal = z[:value].abs
        end
        
        tempArray.push({:source => [source[:x_coord],source[:y_coord]], :target => [target[:x_coord],target[:y_coord]], :value => z[:value],  :partner => z[:partner_name]})
      
      end
      fishmealArray[e.to_sym] = tempArray
    end
    
   
    return {:data => fishmealArray, :max => maxFishmeal}
  
  
  end

end