require "json"
require "lib/graph_helper"
include Graph_Helper

class BudgetUs < Sinatra::Base

  get "/show_program" do
    graph_type = params[:graph_type]
    unique_id = params[:public_id]
    unique_id = unique_id.match(/[0-9]*/).to_s
    unique_id = unique_id.to_i
    makeNew = params[:makeNew]
    budget_column = params[:budget_type]
    
    #select account id column here based on input parameter (1 is the default)
    if defined? params[:nesting]
      nesting = params[:nesting]
    else
      nesting= 1
    end
    
    nesting_column = "account_ids"+nesting.to_s
  
    
    result = UniqueSearch.select(nesting_column.to_sym, :base_level, :browse_name, :trunk_id, :branch_id).where(:unique_id =>  unique_id).first
    level_column = result[:base_level]
    browse_name= result[:browse_name]
    complete_parent_ids = result[:trunk_id]
    complete_child_ids = result[:branch_id]
    
    
    #result.all.map! {|e| e[nesting_column.to_sym]}
   
    find_id = result[nesting_column.to_sym].to_s.split(",")
    looping = find_id
    
    level_array = ["program","bureau","agency","subfunction"]
   
    column_select =  level_array[[level_array.index(level_column)-1,0].max]

    if params[:makeNew] == "true" && level_column != "program"
      column_select = level_array[[level_array.index(column_select)+1,3].min]
    end
   
    

    if looping[0] == "All"   
      looping.shift
      column_select = level_column 
    end
 
    output = create_data(looping,column_select,unique_id,nesting,budget_column,graph_type,makeNew,complete_parent_ids,complete_child_ids)  #true,level_column,super_level,params[:level_cat],params[:public_id])
   
    outputBig = {:mainOut => output, :links=> browse_name}
    return outputBig.to_json
  end
    

  def create_data(find_id,level_column,unique_id,nesting,budget_column,graph_type,makeNew,parent_ids,child_ids)


    nesting_column = "account_ids"+nesting.to_s
    unique_id = unique_id.to_i
    budget_col = budget_column.to_sym
    
    if child_ids.to_i == 0
      child_ids = unique_id
    else
      child_ids = child_ids.to_s.split(",")
    end
    parent_ids = parent_ids.to_s.split(",")
    
    result = UniqueSearch.select(nesting_column.to_sym, :browse_name, :base_level).where(:unique_id =>  [parent_ids,unique_id].flatten).all

    level_array = ["subfunction","agency","bureau","program"]
    search_levels = level_array[(level_array.index(level_column)-parent_ids.size)..(level_array.index(level_column)-1)]
    search_levels.map! {|e| e.to_sym}

    if parent_ids[0].to_i != 0
      parent_find = result.select{|e| e[:base_level] == search_levels[0].to_s}
      super_level_find = parent_find[0][nesting_column.to_sym].split(",")
      if super_level_find[0] == "All"
        super_level_find.shift
      end
    else
      super_level_find = find_id
    end
    
    parent_level_names = result.map! {|e| e[:browse_name].gsub(/ \(.*\)/,"")}
    parent_level_names.pop
      
    program = Program.select_group(level_column.to_sym, :year, :is_medicare).select_append{sum(budget_col).as(sum)}.select_append{sum(budget_percent).as(sum_percent)}.select_append{sum(budget_dollar).as(sum_dollar)}.select_append{sum(restrict_percent).as(sum_restricted)}.where(:id =>  find_id).sort_by(&:year)
    parents= Program.select(:year,:is_medicare, level_column.to_sym).select_append{search_levels}.select_append{sum(budget_col).as(sum)}.select_append{sum(budget_percent).as(sum_percent)}.select_append{sum(budget_dollar).as(sum_dollar)}.select_append{sum(restrict_percent).as(sum_restricted)}.group(:year, :is_medicare, :subfunction, :agency, :bureau, :program).where(:id => super_level_find).sort_by(&:year)
    
    parent_level_values = Array.new()
    #select the ones that refer to the specific parent in tree, then loop through each year, and take the relevant data to put in timeline
    if graph_type == "line" && parent_ids[0].to_i != 0
     
      parent_level_values = create_parent_timelines(parents,search_levels,parent_level_values,parent_level_names)
     
      parent_branch = UniqueSearch.select(:branch_id, :unique_id).where(:unique_id => parent_ids).all
      parent_branch.map! {|e| e.values}
      parent_level_ids = Array.new()
     
      parent_ids.each do |p_id|
        temp = parent_branch.find{|e| e[:unique_id]==p_id.to_i}
        parent_level_ids.push temp[:branch_id].split(",")[0]
      end
      
      parent_name_tree = ""
      parent_level_names_tree = parent_level_names[(nesting.to_i-1)..-1]
      parent_level_names_tree.each do |branch|
        parent_name_tree= parent_name_tree+"-->"+branch
      end
      parent_name_tree = parent_name_tree[3..-1]
    end
   
    
    #---find parents ---
    if graph_type == "bar"
      output = bar_chart(unique_id,nesting_column,level_column,budget_col)
      timeline = output[:timeline]
      timeline_titles = "null"
      timeline_restricted = output[:timeline_restricted]
      timeline_ids = output[:timeline_ids]
    end
    
    
    
    program.map! {|val| val.values}
    super_level =  search_levels.last

    program_unique = program.collect{|e| e[level_column.to_sym]}.uniq
    
    program_loop = Array.new()
    program_unique.each do |unique_level|
      program_loop.push(program.select {|e| e[level_column.to_sym] == unique_level})
    end
    
    if parent_name_tree
      unique_div_id_search = parent_name_tree+"-->"#+last
    else
      unique_div_id_search = program[0][level_column.to_sym]
      parent_level_id = unique_id+1
    end
    
    if parent_ids[0].to_i != 0  
      result = UniqueSearch.select(:unique_id, :branch_id, :browse_name, :base_level).where(:search_name => /#{unique_div_id_search}.*/, :unique_id =>child_ids).all
      #need the current id, need the next branch (listing), and the name, and need it in order that seaching through the loop
      labelling_array = Array.new()
      
      program_unique.each do |unique|
        temp = result.find{|e| e[:browse_name].gsub(/ \(.*\)/,"") == unique}
        if temp[:base_level] == "program"
          branches = temp[:unique_id]
        else
          branches = temp[:branch_id].split(",")[1]
        end
        temp_output = {:id=>temp[:unique_id], :branch_id=>branches, :name => temp[:browse_name].gsub(/ \(.*\)/,"")}
        labelling_array.push (temp_output)
      end
      
      full_title = parent_level_names_tree.flatten
    end
 
    big_output = Array.new() #for the return
    id_index = 0
    
    program_loop.each do |program|
    
      if graph_type == "line"
        timeline_out = timeline_output_maker(program,parent_level_values,parent_ids)
        timeline = timeline_out[:timeline]
        timeline_restricted = timeline_out[:timeline_restricted]
        timeline_ids = "null"
      end
      
      
      
      current = program.detect{|f| f[:year] == 2012}  
    
      title_string = ''
      string_repeat = 1
      if parent_ids[0].to_i != 0 
        end_title = labelling_array[id_index][:name]
        current_id = labelling_array[id_index][:id]
        link_id =  labelling_array[id_index][:branch_id]
      else
        end_title =  unique_div_id_search
        current_id = unique_id
        link_id = unique_id+1
      
      end
      
      
      if full_title
        full_title.each do |e|
          title_string = title_string + '<a class="noDecorate" onmouseover = "showDescription($(this),1)"  onmouseout = "showDescription($(this),2)" onclick="searchChild('+parent_level_ids[string_repeat-1].to_s+')">'+ e +'</a><br>'+ ('&nbsp'*string_repeat*3)+'-->'
          string_repeat+=1
        end
      end
      title_string = title_string + '<a class="noDecorate" onmouseover = "showDescription($(this),1)"  onmouseout = "showDescription($(this),2)" onclick="searchChild('+link_id.to_s+')">'+ end_title +'</a><br>'
  
      if makeNew == "true"
        unique_div_id = unique_id
      else
        unique_div_id = current_id 
      end
    
      user_pay = {:title => title_string, :restrict_percent => current[:sum_restricted], :budget_percent =>  current[:sum_percent],  :budget_dollar =>  current[:sum_dollar], :public_id => unique_div_id.to_s+"_divIndex", :is_medicare => current[:is_medicare]}
      timeline_title = Array.new()
      timeline_title = [parent_level_names, end_title].flatten
      
      if parent_level_names.size == 0 
        grand_parents = end_title
      else
        grand_parents = parent_level_names.first
      end
      
     
      output = {:timeline=> timeline, :timeline_restricted => timeline_restricted, :timeline_ids => timeline_ids, :current => user_pay, :timeline_titles =>  timeline_title, :nesting_level_possible => (parent_level_names.size+1), :nesting_level_current => nesting, :grandparent => grand_parents}  
      big_output.push(output)
      
      id_index+=1
      
    end
    
    return big_output
  end
  
  
  get "/change_graph" do
  
    id = params[:id]
    nesting = params[:nesting]
    nesting_column = "account_ids"+nesting
    chart_type =  params[:graph_type]
    budget_col = params[:budget_type]
    
    result = UniqueSearch.select(nesting_column.to_sym, :base_level,  :trunk_id, :neighbor_ids).where(:unique_id => id).first
    level_column = result[:base_level]
        
    if chart_type == "line"
      parent_ids = result[:trunk_id].split(",")
      #result.map! {|e| e[nesting_column.to_sym]}
      result = result[nesting_column.to_sym]
      find_id = result.split(",")
      if find_id[0] == "All"        
        find_id.shift
      end
    
      result = UniqueSearch.select(:browse_name).where(:unique_id =>  parent_ids.flatten).all
      parent_level_names = result.map {|e| e[:browse_name].gsub(/ \(.*\)/,"")}
      output = line_chart(id,find_id,nesting_column,level_column,budget_col,parent_level_names,parent_ids)
    else
      find_id = result[:neighbor_ids].split(",")
      #timeline_ids = find_id.collect{|i| i.to_i}.sort
      output = bar_chart(id,find_id,nesting_column,level_column,budget_col)
    end
    
    return output.to_json
   
  end
  
  def bar_chart(unique_id,find_id,nesting_column,level_column,budget_col)

    timeline_ids = find_id.collect{|i| i.to_i}.sort
    result = UniqueSearch.select(nesting_column.to_sym, :browse_name).where(:unique_id => find_id).sort_by(&:unique_id)
    
    names = result.map {|e| e.values[:browse_name].gsub(/ \(All -- Total\)| \(All -- List\)/,"")}
   
    result.map! {|e| e.values}
    find_id = Array.new()
    result.each do |x|
      temp = x[nesting_column.to_sym].split(",")
      find_id.push temp
    end
    find_id = find_id.flatten.uniq
    
    if find_id.index("All") != nil
      find_id.delete_at(find_id.index("All"))
    end
    program = Program.select_group(level_column.to_sym).select_append{sum(budget_col.to_sym).as(sum)}.select_append{sum(restrict_percent).as(sum_restricted)}.where(:id => find_id, :year => 2012).all
  
    program.map! do |e| 
      e.values
    end
    
    output_data = Array.new()
    output_data_r = Array.new()
    names.each do |this_name|
      #order them by unique id
      temp = program.detect {|e| e[level_column.to_sym]==this_name}
      output_data.push [temp[level_column.to_sym],temp[:sum]]
      output_data_r.push [temp[level_column.to_sym],temp[:sum_restricted]]
      
    end
    
    output = {:timeline => output_data, :timeline_titles => "placeHolder", :timeline_ids => timeline_ids, :timeline_restricted => output_data_r}
    
  return output
  
  
  end
  

  
  def line_chart(unique_id,find_id,nesting_column,level_column,budget_column,parent_level_names,parent_ids)
  
    #nesting_column = "account_ids"+nesting.to_s
    result = UniqueSearch.select(nesting_column.to_sym, :browse_name, :base_level).where(:unique_id =>  [parent_ids,unique_id].flatten).all

    level_array = ["subfunction","agency","bureau","program"]
    search_levels = level_array[(level_array.index(level_column)-parent_ids.size)..(level_array.index(level_column)-1)]
    search_levels.map! {|e| e.to_sym}
     
    if parent_ids[0].to_i != 0
      parent_find = result.select{|e| e[:base_level] == search_levels[0].to_s}
      super_level_find = parent_find[0][nesting_column.to_sym].split(",")
      if super_level_find[0] == "All"
        super_level_find.shift
      end
    else
      super_level_find = find_id
    end
   
    budget_col = budget_column.to_sym 
    parents= Program.select(:year,:is_medicare, level_column.to_sym).select_append{search_levels}.select_append{sum(budget_col).as(sum)}.select_append{sum(budget_percent).as(sum_percent)}.select_append{sum(budget_dollar).as(sum_dollar)}.select_append{sum(restrict_percent).as(sum_restricted)}.group(:year, :is_medicare, :subfunction, :agency, :bureau, :program).where(:id => super_level_find).sort_by(&:year)
    program = Program.select_group(level_column.to_sym, :year, :is_medicare).select_append{sum(budget_col).as(sum)}.select_append{sum(budget_percent).as(sum_percent)}.select_append{sum(restrict_percent).as(sum_restricted)}.where(:id => find_id).sort_by(&:year)
    
    parent_level_values = Array.new()
    parent_level_values = create_parent_timelines(parents,search_levels,parent_level_values,parent_level_names)
   
    
    timeline_out = timeline_output_maker(program,parent_level_values,parent_ids)
    timeline = timeline_out[:timeline]
    timeline_restricted = timeline_out[:timeline_restricted]

    current = program.detect{|f| f[:year] == 2012}  
    timeline_title = [parent_level_names, current[level_column.to_sym]].flatten
    
    output = {:timeline=> timeline, :timeline_titles =>  timeline_title, :timeline_restricted => timeline_restricted, :is_medicare => current[:is_medicare]}  
    return output

  end
  
end