require "json"

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
  
    
    result = UniqueSearch.select(nesting_column.to_sym, :base_level, :browse_name).where(:unique_id =>  unique_id).all
    level_column = result.first[:base_level]
    browse_name= result.first[:browse_name]
    
    result.map! {|e| e[nesting_column.to_sym]}
   
    find_id = result[0].to_s.split(",")
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
 
    output = create_data(looping,column_select,unique_id,nesting,budget_column,graph_type,makeNew)  #true,level_column,super_level,params[:level_cat],params[:public_id])
   
    outputBig = {:mainOut => output, :links=> browse_name}
    return outputBig.to_json
  end
  
  

  get "/specify_program" do
  
    
    title = params[:title]
    title = title.match(/Select a/).to_s
    newID = ""
    newIDValue = ""
    className = "programSort"
    case params[:level]
      when "subfunction"
        newID = "agency"
      when "agency"
        newID = "bureau"
      when "bureau"
        newID = "program"
        className = "programSelect"
    end
    
    output =  '<div class="browseAlignment"><div class="browseLabel">'+newID[0].capitalize+newID[1..-1]+':</div><div class="browsing"><select class="'+className+'" id="'+newID+'" onchange = "progSelect($(this))">
            <option value="none">--Select a sub-category below--</option>'
          
    if title == "Select a" && params[:level] == "subfunction"
      branches = UniqueSearch.select(:browse_name, :unique_id).where(:first_browse=> "unested").sort_by(&:browse_name)
      new_searches = branches.map {|e| e.values} 
    else
      branches = UniqueSearch.select(:branch_id).where(:unique_id => params[:id]).all[0].values
      all_branches = branches[:branch_id].split(",").map {|s| s.to_i}
      new_searches = UniqueSearch.select(:unique_id, :browse_name).where(:unique_id => all_branches).reverse_order(:sort_value).order_append(:browse_name).all#sort_by(&:sort_value).reverse
      new_searches.map! {|e| e.values}
    end
    new_searches.each do |option|
      output = output + '<option value="'+option[:unique_id].to_s+'">'+option[:browse_name]+'</option>'
    
    end
   
    output = output+"</select></div></div>"    
    return output
  
  end
  
  

  def create_data(find_id,level_column,unique_id,nesting,budget_column,graph_type,makeNew)

    
    #----find children----
    nesting_column = "account_ids"+nesting.to_s
    unique_id = unique_id.to_i
    budget_col = budget_column.to_sym
    
    program = Program.select_group(level_column.to_sym, :year, :is_medicare).select_append{sum(budget_col).as(sum)}.select_append{sum(budget_percent).as(sum_percent)}.select_append{sum(budget_dollar).as(sum_dollar)}.select_append{sum(restrict_percent).as(sum_restricted)}.where(:id => find_id).sort_by(&:year)


    #---find parents ---
    parent_unique_id = unique_id
    fail_safe = 0
    parent_level_values = Array.new()
    parent_level_names = Array.new()
    parent_level_ids = Array.new()
    
    child_div_ids =  UniqueSearch.select(:branch_id).where(:unique_id => unique_id).all[0][:branch_id]
    if child_div_ids.to_i == 0
    
      child_div_ids = unique_id
    else
      child_div_ids = child_div_ids.split(",")
    end

      while(true)
        parent_id = UniqueSearch.select(:trunk_id).where(:unique_id => parent_unique_id).all[0][:trunk_id]
        
        if parent_id.to_i == 0 ||  parent_id ==  parent_unique_id
          break
        end
       
        find_id = UniqueSearch.select(nesting_column.to_sym, :browse_name, :branch_id).where(:unique_id => parent_id).all
        account_id_string = find_id[0][nesting_column.to_sym]
        account_id_array = account_id_string.split(",").map {|x| x.to_i}
        
        parent_link_id = find_id[0][:branch_id].split(",")[0]#[1]
        result = Program.select{sum(budget_col).as(sum)}.select_append{sum(restrict_percent).as(sum_restricted)}.where(:id => account_id_array).group(:year).all
        result.map! {|x| {:sum => x.values[:sum], :sum_restricted => x.values[:sum_restricted]} }
  
        parent_unique_id = parent_id
        parent_level_values.push result
        parent_level_names.push find_id[0][:browse_name]
        parent_level_ids.push parent_link_id
        if fail_safe > 3 
          break
        end
        
        fail_safe+=1
      end
      
      parent_level_names = parent_level_names.reverse
      parent_level_values = parent_level_values.reverse
      parent_level_ids = parent_level_ids.reverse
      
    if graph_type == "bar"
      output = bar_chart(unique_id,nesting_column,level_column,budget_col)
      timeline = output[:timeline]
      timeline_titles = "null"
      timeline_restricted = output[:timeline_restricted]
      timeline_ids = output[:timeline_ids]
    end
    
    program.map! {|val| val.values}
    
    level_array = ["program","bureau","agency","subfunction"]
    sub_level =  level_array[[parent_level_names.size,3].min]

    program_unique = program.uniq {|e| e[level_column.to_sym]}
   
    program_loop = Array.new()
    program_unique.each do |unique_level|
      program_loop.push(program.select {|e| e[level_column.to_sym] == unique_level[level_column.to_sym]})
    end
    
    big_output = Array.new() #for the return

    id_index = 1
    
    #this bit here is specific to the database, if change the way you denote the tree in R, then have to change this!!!
    parent_name_tree = ""
    parent_level_names_tree = parent_level_names[(nesting.to_i-1)..-1]
    parent_level_names_tree.each do |branch|
      parent_name_tree= parent_name_tree+"-->"+branch
    end
    parent_name_tree = parent_name_tree[3..-1]
   
    
    program_loop.each do |program|
    
   
   
    
      currentPay = 0
   
      if graph_type == "line"
        timeline = Array.new()
        timeline_restricted = Array.new()
      
        index = 0
        
        program.each do |year_val|
 
          temp = Array.new()
          temp_r = Array.new()
          temp.push year_val[:year]
          temp_r.push year_val[:year]
     
          parent_level_values.each do |parent|
            temp.push parent[index][:sum] ##need to select both here
            temp_r.push parent[index][:sum_restricted]
          end
          temp.push year_val[:sum]
          temp_r.push year_val[:sum_restricted]
          timeline.push temp
          timeline_restricted.push temp_r
          index +=1
        end
        timeline_ids = "null"
      end
      
      current = program.detect{|f| f[:year] == 2012}  
      
      if level_column == "program"
        last = current[:program].to_s
      else
        last = current[level_column.to_sym].to_s
      end
      
      if parent_name_tree
        unique_div_id_search = parent_name_tree+"-->"+last
      else
         unique_div_id_search = last
      end
      
      
      full_title = [parent_level_names_tree,current[level_column.to_sym].to_s].flatten#[((nesting.to_i)-1)..-1]
      
      result = UniqueSearch.select(:unique_id, :branch_id).where(:search_name => /#{unique_div_id_search}.*/, :unique_id =>child_div_ids).first
      unique_div_id = result[:unique_id]
      
      #unique_div_id = child_div_ids[(id_index-1)]
      #result = UniqueSearch.select(:branch_id).where(:unique_id => unique_div_id).first
      if level_column == "program"
        sublevel_link_id = unique_id
      else
        sublevel_link_id = result[:branch_id].split(',')[1]#[1] #choose the second (list) on the aggregate associated with this
        if sublevel_link_id == nil 
          sublevel_link_id = unique_div_id+1
        end
      end
  
      title_string = ''
      string_repeat = 1
      full_title.each do |e|
        if string_repeat == full_title.size
          # sublevel_link_id
          title_string = title_string + '<a class="noDecorate" onmouseover = "showDescription($(this),1)"  onmouseout = "showDescription($(this),2)" onclick="searchChild('+sublevel_link_id.to_s+','+unique_div_id.to_s+')">'+ e +'</a><br>'
        else
          title_string = title_string + '<a class="noDecorate" onmouseover = "showDescription($(this),1)"  onmouseout = "showDescription($(this),2)" onclick="searchChild('+parent_level_ids[string_repeat-1].to_s+','+unique_div_id.to_s+')">'+ e +'</a><br>'+ ('&nbsp'*string_repeat*3)+'-->'
        end
        string_repeat+=1
      end
  
      if makeNew == "true"
        unique_div_id = unique_id
      end
    
      user_pay = {:title => title_string, :restrict_percent => current[:sum_restricted], :budget_percent =>  current[:sum_percent],  :budget_dollar =>  current[:sum_dollar], :public_id => unique_div_id.to_s+"_divIndex", :is_medicare => current[:is_medicare]}
     
      timeline_title = Array.new()
      timeline_title = [parent_level_names, current[level_column.to_sym]].flatten

      output = {:timeline=> timeline, :timeline_restricted => timeline_restricted, :timeline_ids => timeline_ids, :current => user_pay, :timeline_titles =>  timeline_title, :nesting_level_possible => (parent_level_names.size+1), :nesting_level_current => nesting}  
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
    result = UniqueSearch.select(nesting_column.to_sym, :base_level).where(:unique_id => id).all
    level_column = result.first[:base_level]
    
    if chart_type == "line"
      output = line_chart(id,nesting_column,level_column,budget_col)
    else
      output = bar_chart(id,nesting_column,level_column,budget_col)
    end
    
    return output.to_json
   
  end
  
  def bar_chart(unique_id,nesting_column,level_column,budget_col)

    
    result = UniqueSearch.select(:neighbor_ids).where(:unique_id =>  unique_id).first
    find_id = result[:neighbor_ids].to_s.split(",")
    timeline_ids = find_id.collect{|i| i.to_i}.sort
    result = UniqueSearch.select(nesting_column.to_sym, :browse_name).where(:unique_id => find_id).sort_by(&:unique_id)
    
    names = result.map {|e| e.values[:browse_name].gsub(/ \(All -- Total\)/,"")}
   
    
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
  
  
  
  
  
  
  def line_chart(unique_id,nesting_column,level_column,budget_column)
  
    #nesting_column = "account_ids"+nesting.to_s
    result = UniqueSearch.select(nesting_column.to_sym, :base_level).where(:unique_id =>  unique_id).all
    result.map! {|e| e[nesting_column.to_sym]}
   
    find_id = result[0].to_s.split(",")
    if find_id[0] == "All"
      
      find_id.shift
      #column_select = level_column 
    end
    budget_col = budget_column.to_sym
    program = Program.select_group(level_column.to_sym, :year, :is_medicare).select_append{sum(budget_col).as(sum)}.select_append{sum(budget_percent).as(sum_percent)}.select_append{sum(restrict_percent).as(sum_restricted)}.where(:id => find_id).sort_by(&:year)

    parent_unique_id = unique_id
    fail_safe = 0
    parent_level_values = Array.new()
    parent_level_ids = Array.new()
    parent_level_names = Array.new()
    
    while(true)
      parent_id = UniqueSearch.select(:trunk_id).where(:unique_id => parent_unique_id).all[0][:trunk_id]
        
      if parent_id.to_i == 0 ||  parent_id ==  parent_unique_id
        break
      end
     
      find_id = UniqueSearch.select(nesting_column.to_sym, :browse_name, :branch_id).where(:unique_id => parent_id).all
      account_id_string = find_id[0][nesting_column.to_sym]
      account_id_array = account_id_string.split(",").map {|x| x.to_i}
      
      parent_link_id = find_id[0][:branch_id].split(",")[0]#[1]
      result = Program.select{sum(budget_col).as(sum)}.select_append{sum(restrict_percent).as(sum_restricted)}.where(:id => account_id_array).group(:year).all
      result.map! {|x| {:sum => x.values[:sum], :sum_restricted => x.values[:sum_restricted]} }

      parent_unique_id = parent_id
      parent_level_values.push result
      parent_level_names.push find_id[0][:browse_name]
   
      parent_level_ids.push parent_link_id
      if fail_safe > 3 
        break
      end
      
      fail_safe+=1
    end
    
    currentPay = 0
    timeline = Array.new()
  
    index = 0
    
    
    timeline = Array.new()
    timeline_restricted = Array.new()
  
    index = 0
    
    program.each do |year_val|
   
      temp = Array.new()
      temp_r = Array.new()
      temp.push year_val[:year]
      temp_r.push year_val[:year]
 
      parent_level_values.each do |parent|
        temp.push parent[index][:sum] ##need to select both here
        temp_r.push parent[index][:sum_restricted]
      end
      temp.push year_val[:sum]
      temp_r.push year_val[:sum_restricted]
      timeline.push temp
      timeline_restricted.push temp_r
      index +=1
    end


    current = program.detect{|f| f[:year] == 2012}  
    
    timeline_title = Array.new()
    timeline_title = [parent_level_names, current[level_column.to_sym]].flatten
    
    output = {:timeline=> timeline, :timeline_titles =>  timeline_title, :timeline_restricted => timeline_restricted, :is_medicare => current[:is_medicare]}  
   
    return output

  end

end