module Graph_Helper

 def create_parent_timelines(parents,search_levels,parent_level_values,parent_level_names)
  
    years = parents.collect{|e| e[:year]}.uniq
    
    years.each do |this_year|
      temp = parents.select{|e| e[:year] == this_year}
      values_array = Array.new()
      restrict_array = Array.new()
      index = 0
      search_levels.each do |this_parent|
        selects = temp.select{|e| e[this_parent] == parent_level_names[index]}
        values = selects.collect{|e| e[:sum_percent]}
        sum = values.inject(:+)
        #values = temp.map {|e| {:sum => e[budget_column], :sum_restricted => e[:sum_restricted]} 
        values_array.push sum
        
        values_restrict = selects.collect{|e| e[:sum_restricted]}
        sum = values_restrict.inject(:+)
        restrict_array.push sum
      index +=1
      end
      parent_level_values.push ({:sum=>values_array, :sum_restricted => restrict_array})

    end

    return parent_level_values  
  end
  
  
  def timeline_output_maker(program,parent_level_values,parent_ids)
    #p parent_level_values
    #p program.size
    timeline = Array.new()
    timeline_restricted = Array.new()
  
    index = 0
    
    program.each do |year_val|

      temp = Array.new()
      temp_r = Array.new()
      temp.push year_val[:year]
      temp_r.push year_val[:year]
      #puts "it gets here"
      if parent_ids[0].to_i != 0  
        parent_level_values[index][:sum].each do |parent|
          #puts "also here #{parent}"
          temp.push parent##need to select both here
          #temp_r.push parent[index][:sum_restricted]
        end
        
        parent_level_values[index][:sum_restricted].each do |parent|
          temp_r.push parent##need to select both here
          #temp_r.push parent[index][:sum_restricted]
        end
      end
      
      temp.push year_val[:sum]
      temp_r.push year_val[:sum_restricted]
      timeline.push temp
      timeline_restricted.push temp_r
      index +=1
    end
  
    return {:timeline => timeline, :timeline_restricted=> timeline_restricted}
  end




end