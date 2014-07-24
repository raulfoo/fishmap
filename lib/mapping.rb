require "json"

class FishMap < Sinatra::Base

  post "/change_map" do
    
    
    per_capita = params[:metric]
    category = params[:id]
    species_select = params[:species]
    year = params[:year].to_i
    filter_val = params[:filterThreshold].to_i
    p filter_val
        
        
    #yeah add a greater than, or less than parameter here if the slider value is not 0    
    if species_select != "All"
      map_select = Splash.filter(:category =>  category, :year => year, :description => species_select).select_group{[region_id, region_name, subset]}.select_append{sum(value).as(value)}.order(:region_name).all.uniq

    else
      map_select = Splash.filter(:category =>  category,  :year => year).select_group{[region_id, region_name]}.select_append{sum(value).as(value)}.order(:region_name).all.uniq

    end
    
    map_select.map! {|e| e.values}
    just_values = map_select.map{|e| e[:value]}
    
   # p just_values
    min_value = just_values.min
    max_value = just_values.max
    #filter map_select by >< values here
   # p "wut here"
    #p map_select
    if filter_val > 0
      map_select = map_select.select! {|e| e[:value] >= 0}
      map_select = map_select.sort_by {|e| e[:value]}
      map_select = map_select.slice(((map_select.length/10).floor-1)*filter_val.abs,map_select.length)
    elsif filter_val < 0 
      map_select = map_select.select! {|e| e[:value] <= 0}
      map_select = map_select.sort_by {|e| -e[:value]}

      map_select = map_select.slice(((map_select.length/10).floor-1)*filter_val.abs,map_select.length)
      p map_select
    end
    
    #map_select.select! {|e| e[:value] >10000}
    detail_species = Splash.filter(:category =>  category, :year => year).select(:description).order(:description).all.uniq
    detail_species = detail_species.map!{|e| e.description}
    
=begin    
    if species_select != "All"
      details = Detail.filter(:category =>  category,  :year => year, :description => species_select).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    else
      details = Detail.filter(:category =>  category,  :year => year).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    end
    
    details.map! {|e| e.values}    
=end    
    unique_region = Connection.filter(:category => category,  :year => year).select(:region_id).order(:region_id).all.uniq
    unique_region.map!{|e| e.region_id}
  
    if per_capita == "T"
      populations = Population.filter(:year => year).all
      populations.map!{|e| e.values}
      
      [map_select].each do |section|  #[map_select,details].each do |section|
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
    
    p "wutwutwut"
    p thresholds
    associationArray = createAssociations(category,species_select,per_capita,year)
    
    years = Splash.where(:category => category).select(:year).sort_by(&:year)
    year_min = years[0].year
    year_max=  years[(years.size-1)].year
  
    #year_min = 1990
    #year_max = 2010
    #output = {:map_values => map_select, :thresholds => thresholds, :details=> details, :nationIds => unique_region, :speciesOptions => detail_species, :assocArray => associationArray}
    output = {:map_values => map_select, :thresholds => thresholds, :nationIds => unique_region, :speciesOptions => detail_species, :assocArray => associationArray, :yearMin => year_min, :yearMax => year_max, :absolute_min => min_value, :absolute_max => max_value}
    
    return output.to_json
  
  end
  
  
  
  post "/getDetails" do
    
    per_capita = params[:metric]
    category = params[:type]
    region_id = params[:region]
    species_select = params[:species]
    year = params[:year]
    
 
    if species_select != "All"
      details = Detail.filter(:category =>  category, :region_id => region_id, :description => species_select).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    else
      details = Detail.filter(:category =>  category, :region_id => region_id).all.uniq#select_group{[region_id, region_name, partner, "category".to_sym]}.select_append{[sum(value).as(value), sum(percent_all).as(percent_all), sum(percent_constrained).as(percent_constrained)]}.all.uniq

    end
    
    details.map! {|e| e.values}    
    
    #unique_region = Connection.filter(:category => category,  :year => year).select(:region_id).order(:region_id).all.uniq
    #unique_region.map!{|e| e.region_id}
  
    if per_capita == "T"
      #populations = Population.filter(:year => year).all
      populations = Population.filter(:region_id => region_id).all
      populations.map!{|e| e.values}
      
   
      [details].each do |section|
        section.each do |temp|
          divisor = populations.select{|e| e[:year] == temp[:year]}[0]
          if divisor != nil && divisor[:value] > 0
            temp[:value] = (temp[:value].to_f)/((divisor[:value].to_f)/1000)
           
          else
            temp[:value] = 0  # should really just remove this entry if error
          end
          
        end
        
        section.delete_if{|e| e[:value] == 0}
      end
    end
    
    output = {:details => details}
    return output.to_json
  
  end
 
  
  def createThresholds(data)
    
    #this may take some work
    raw_reds = ["#67000D","#A50F15","#CB181D", "#EF3B2C","#FB6A4A","#FC9272","#FCBBA1","#FEE0D2","#FFF5F0"]
    raw_blues = ["#F7FBFF", "#DEEBF7", "#C6DBEF", "#9ECAE1", "#6BAED6", "#4292C6", "#2171B5", "#08519C", "#08306B"] #"#F7FBFF"
    reds = []
    blues = []
    
    data = data.sort
    splits = 8
    num_negatives = 0
    outArray = []
    
    if data.max < 0 #do only reds
      raw_reds = raw_reds.reverse

      p "hello"
      p data
      data = data.reverse
      split_size = [1,(data.size/8).floor].max
      
      firstBinAdd = data.size % (split_size*8)
      colorIndex = 0
      temp_threshold = data[split_size-1+firstBinAdd]
      temp_color = raw_reds[colorIndex]
      outArray.push({:color => temp_color, :level_value => (temp_threshold+0.0001)})
      colorIndex = 1
      temp_dat = data.slice(split_size+firstBinAdd,data.length) 
      temp_dat.each_slice(split_size) do |slice|
        p slice
        temp_threshold = slice.min
        temp_color = raw_reds[colorIndex]
        outArray.push({:color => temp_color, :level_value => (temp_threshold+0.0001)})
        colorIndex += 1
      end
      outArray = outArray.sort_by{|e| e[:level_value]}

      
    elsif data.min > 0  # do only reds

      split_size = [1,(data.size/8).floor].max
      firstBinAdd = data.size % (split_size*8)
      colorIndex = 0
      temp_threshold = data[split_size-1+firstBinAdd]
      temp_color = raw_blues[colorIndex]
      outArray.push({:color => temp_color, :level_value => (temp_threshold+0.0001)})
      colorIndex = 1
      temp_dat = data.slice(split_size+firstBinAdd,data.length) 
      temp_dat.each_slice(split_size) do |slice|
        temp_threshold = slice.max
        temp_color = raw_blues[colorIndex]
        outArray.push({:color => temp_color, :level_value => (temp_threshold+0.0001)})
        colorIndex += 1
      end
      
    else # do this stuff
      
      p "look here"
      p data
     
      
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
      
    end
    
    return outArray
  end
  
  
  def createAssociations(cate,species,metric,year)
    if species == "All"
      connections = Connection.filter(:category => cate,  :year => year).select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.order(:value).reverse.all.uniq
    else
      connections = Connection.filter(:category => cate,  :year => year, :description => species).select_group{[category, region_id, partner_id, region_name, partner_name,]}.select_append{sum(value).as(value)}.order(:value).reverse.all.uniq
    end
    
    if metric == "T"
      populations = Population.filter(:year => year).all
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
      selects = fishmeal.select{|d| d[:region_id] == e && d[:partner_name] != "Aquaculture"}
      selects = selects.slice(0,4).push(selects.slice(selects.length-5,selects.length-1)).uniq.flatten #limited to just the top 5 and bottom 5
      selects.delete_if {|x| x == nil}
   
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
  
  
  post "/create_rank_list" do
    category = params[:category]
    year = params[:year]
    species = params[:species]
    subset=params[:subset]
    per_capita = params[:per_capita]
    
    subset_hash = "subset"
    if category == "Fishmeal"
      subset_hash = "partner"
    end
    
    p year
    if year == "All"
      year = (1980..2010).to_a
    end
    
    subset_hash = subset_hash.to_sym
    
    if species == "All" || species == nil || species == ""
      species = /.*/
    end

    
    if subset != "All"
      ranks = Detail.where(:category=> category, :year => year, subset_hash => subset, :description => species).select(:region_name, subset_hash, :region_id).group_by(subset_hash, :region_name, :region_id).select_append{sum(value).as(value)}.all
      #ranks = ranks.select{|e| e.subset == subset}
    else

      if category == "Fishmeal"
        ranks = Detail.where(:category=> category, :year => year, subset_hash=>['Export','Import','Re-export'], :description => species).select(:region_name, :region_id).group_by(:region_name, :region_id).select_append{sum(value).as(value)}.all

      else
        ranks = Detail.where(:category=> category, :year => year, :description => species).select(:region_name, :region_id).group_by(:region_name, :region_id).select_append{sum(value).as(value)}.all
      end
    end
    
    ranks.map!{|e| e.values}
    
    
    if per_capita == "T"
      populations = Population.filter(:year => year).all
      populations.map!{|e| e.values}
      
      [ranks].each do |section|  #[map_select,details].each do |section|
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
    
    
    return ranks.to_json
  end

end