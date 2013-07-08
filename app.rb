require "bundler/setup"
require "pathological"
require "sinatra/base"
require "sinatra/reloader"
require "coffee-script"
require "sinatra/content_for2"
require "rack-flash"
#require "opengraph"
require "open-uri"
require "json"
require "lib/db"
require "lib/currency"
require "lib/mapping"



class FishMap < Sinatra::Base
  enable :sessions
  set :session_secret, "abcdefghijklmnop"
  set :views, "views"
  set :public_folder, "public"
  set :protection, :except => :frame_options
  
  use Rack::Flash

  helpers Sinatra::ContentFor2

  configure :development do
    register Sinatra::Reloader
    also_reload "lib/*"
    also_reload "models/*"

  end
  
  before do
    #@sortingFunction = UniqueSearch.filter(:first_browse => "nested").sort_by(&:browse_name).uniq
    #@sortingAgency =  UniqueSearch.filter(:first_browse => "unested").sort_by(&:browse_name).uniq
    #@text_search = UniqueSearch.filter(:search_text => true)
    #@map_list= MapRange.select(:agency, :agency_id).sort_by(&:agency).uniq
    #@gdp = EconomySize.all
  end
  
  configure do
    set :root, File.expand_path(File.dirname(__FILE__))
  end

  def initialize(pinion)
    @pinion = pinion    
    super
  end
  

  get "/" do
    erb :index
  end
  
  get "/about" do
    erb :faq
  end
  
  get "/map" do
    erb :map
  end
  

  def production?() ENV["RACK_ENV"] == "production" end
  
  #def enforce_required_params(fields)
  #  empty_fields = fields.select { |field| params[field].nil? || params[field].empty? }
  #  empty_fields.empty? ? [] : ["At least one search ingredient is required!"]
  #end

end
