require "json"

class FishMap < Sinatra::Base

  post "/change_map" do
    
    
    per_capita = params[:metric]
    category = params[:id]
    species_select = params[:species]
    
    if species_select != "All"
      map_select = Splash.filter(:category =>  category, :description => species_select).select_group{[region_id, region_name, subset]}.select_append{sum(value).as(value)}.order(:region_name).all.uniq

    else
      map_select = Splash.filter(:category =>  category).select_group{[region_id, region_name]}.select_append{sum(value).as(value)}.order(:region_name).all.uniq

    end
    
    map_select.map! {|e| e.values}
    
    p map_select.size
    detail_species = Splash.filter(:category =>  category).select(:description).order(:description).all.uniq
    detail_species = detail_species.map!{|e| e.description}
 
    if species_select != "All"
      details = Detail.filter(:category =>  category, :description => species_select).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    else
      details = Detail.filter(:category =>  category).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    end
    
    details.map! {|e| e.values}    
    
    unique_region = Connection.filter(:category => category).select(:region_id).order(:region_id).all.uniq
    unique_region.map!{|e| e.region_id}
  
    if per_capita == "T"
      populations = Population.filter(:year => 2010).all
      populations.map!{|e| e.values}
      
   
      [map_select,details].each do |section|
        section.each do |temp|
          divisor = populations.select{|e| e[:region_id] == temp[:region_id]}[0]
          if divisor != nil && divisor[:value] > 0
            temp[:value] = (temp[:value].to_f)/((divisor[:value].to_f)/1000)
           
          else
            temp[:value] = 0  # should really just remove this entry if error
          end
          
        end
        
        section.delete_if{|e| e[:value] == 0}
      end
    end
    
  
    thresholdDat = map_select.map{|e| e[:value]}
    thresholds = createThresholds(thresholdDat)
    
    associationArray = createAssociations(category,species_select,per_capita)
    
  
    output = {:map_values => map_select, :thresholds => thresholds, :details=> details, :nationIds => unique_region, :speciesOptions => detail_species, :assocArray => associationArray}
    
    return output.to_json
  
  end
 
  
  def createThresholds(data)
    
    raw_reds = ["#67000D","#A50F15","#CB181D", "#EF3B2C","#FB6A4A","#FC9272","#FCBBA1","#FEE0D2","#FFF5F0"]
    raw_blues = ["#F7FBFF", "#DEEBF7", "#C6DBEF", "#9ECAE1", "#6BAED6", "#4292C6", "#2171B5", "#08519C", "#08306B"] #"#F7FBFF"
    reds = []
    blues = []
    
    data = data.sort
        
    splits = 8
    num_negatives = 0
   
    
    neg_data = data.select{|e| e<0}
    num_negatives = neg_data.size
    
    pos_data = data.select{|e| e>=0}
    num_neg_groups = 0
    neg_group_size = 0
    neg_splits = (splits*(num_negatives.to_f/data.size.to_f)).floor
    if neg_splits > 0
      neg_group_size = (num_negatives/neg_splits).floor
    end
    
    
    
    if neg_group_size > 0
      num_neg_groups = neg_splits+1
      #neg_splits = num_neg_groups-1
      
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
      
    
  
    num_pos_groups = [[9-num_neg_groups,3].max,data.length].min
    pos_group_size = [(pos_data.size/num_pos_groups).floor,1].max
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
          temp_threshold = neg_data[(step*neg_group_size)-1]
        else
          temp_threshold = neg_data.last
        end
        if temp_threshold < 0 
          temp_color = reds.shift
        else
          temp_color = blues.shift
        end
        outArray.push({:color => temp_color, :level_value => (temp_threshold+0.0001)})
      
        
      end
    end
   
    
    (1..(pos_splits)).each do |step|
      if step < (pos_splits)
        temp_threshold = pos_data[(step*pos_group_size)-1]
      else
        temp_threshold = pos_data.last 
      end
      if temp_threshold < 0 
        temp_color = reds.shift
      else
        temp_color = blues.shift
      end
      outArray.push({:color => temp_color, :level_value => (temp_threshold+0.0001)})
    
      
    end
    
    
    return outArray
  end
  
  
  def createAssociations(cate,species,metric)
    if species == "All"
      connections = Connection.filter(:category => cate).select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.all.uniq
    else
      connections = Connection.filter(:category => cate, :description => species).select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.all.uniq
    end
    
    if metric == "T"
      populations = Population.filter(:year => 2010).all
      populations.map!{|e| e.values}
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
        if metric == "T"
          divisor = populations.select{|e| e[:region_id] == z[:region_id]}[0]
        
          if divisor != nil && divisor[:value] > 0
           
            z[:value] = ((z[:value].to_f)/((divisor[:value].to_f)/1000))
            if  z[:value] > 1
              z[:value] = z[:value].round(2)
            elsif z[:value] < 1
              z[:value] = z[:value].round(5)
            end
          
          else
            z[:value] = 0  # should really just remove this entry if error
          end
        end
          
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