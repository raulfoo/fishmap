class BudgetUs < Sinatra::Base

  get "/search_suggest" do
    
    search = params[:letters]
    raw_search = params[:letters]
    full_search = params[:full_search]
    search = Regexp.new(Regexp.escape(search), "i")
    program_suggestions = UniqueSearch.select(:browse_name).where(:browse_name => search, :search_text => true).sort_by(&:unique_id).uniq   #can make it a little smart by searching by search_name, and then sorting so closest browse_names are at top
    
    if full_search == "false"
      output = program_suggestions[0..7]
    else
      output = program_suggestions
    end
    
    
    output.map! {|e| e.browse_name}
    
    if program_suggestions.size > output.size
      output.push "View More"
    end 
    
    allOut = ""
    output.each do |temp|
      allOut = allOut + '<tr class="opaqueRow"><td><p class="textSearchSelect" onclick="getResult'
      allOut = allOut + "('"+temp+"','"+raw_search+"')"
      allOut = allOut+ '">'+temp+'</p></td></tr>'
    end
   
    return allOut
  
  
  end
  
  
  
   get "/search_find" do
   
     search = params[:input]
     search = search.gsub(/ \(.*\)/,"")
    
     search = Regexp.new(Regexp.escape(search), "i")
     resultAll = UniqueSearch.select(:unique_id, :browse_name, :base_level).where(:search_name => search, :search_text => true).all#.sort_by(&:times_selected)
 
     
     resultAll.map! {|e| e.values}
  
     if resultAll == nil 
       output = 0
     else
       uniqueNames = Array.new
       uniqueNames = resultAll.collect {|e| e[:browse_name]}.uniq
       level_array = ["program","bureau","agency","subfunction"].reverse
       
       output = Array.new()
       if uniqueNames.size > 8
         uniqueNames = uniqueNames[0..8] 
       end
       uniqueNames.each do |name|
         level_array.each do |level|
           find = resultAll.detect {|e| e[:browse_name]==name && e[:base_level] == level}
           if find != nil
             output.push find[:unique_id]
             break
           end
         end
       end
      
   
     bigOut = {:original_search => params[:input], :output=>output}

     end
     
     return bigOut.to_json
   
   end
   
   get "/description_find" do
   
     search = params[:input]
     search = Regexp.new(Regexp.escape(search), "i")
     result = Description.select(:description).where(:name => search).first#.sort_by(&:times_selected)
     
     if result == nil 
       return_description = "No description available"
     else
       return_description = result[:description]
     end
     
     output = {:description=>return_description}
     return output.to_json
   
   end




end