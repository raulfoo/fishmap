def set_application_paths(app)
  set :deploy_to, "/opt/#{app}"
  set :staging_path, "/tmp/#{app}"
  set :local_path, Dir.pwd
  set :release_path, "#{deploy_to}/releases/#{Time.now.strftime("%Y%m%d%H%M")}"
end

def set_common_environment
  env :db_host, "localhost"
  env :db_name, "fishmap"
  env :db_user, "fishmap"
end

set :app, "fishmap"
set_application_paths(app)
set :user, "fishmap"

role :root_user, :user => "root"
role :fishmap_user, :user => "fishmap"

destination :vagrant do
  set :domain, "fishmap-vagrant"
  set_common_environment
  env :rack_env, "production"
  env :port, 3200
end

destination :staging do
  set :app, "fishmap_staging"
  set_application_paths(app)
  set :domain, "173.255.223.11"
  set_common_environment
  env :rack_env, "staging"
  env :db_name, "fishmap_staging"
  env :db_user, "fishmap_staging"
  env :port, 3100
  env :unicorn_workers, 2
  env :s3_bucket, "staging.fishmap.org"
end

destination :prod do
  set :domain, "173.255.223.11"
  set_common_environment
  env :rack_env, "production"
  env :db_name, "fishmap"
  env :db_user, "fishmap"
  env :port, 3200
  env :unicorn_workers, 10
  env :s3_bucket, "fishmap.org"
end

# Load secure credentials
if ENV.has_key?("FISHMAP_CREDENTIALS") && File.exist?(ENV["FISHMAP_CREDENTIALS"])
  load ENV["FISHMAP_CREDENTIALS"]
else
  puts "Unable to locate the file $FISHMAP_CREDENTIALS. You need this to deploy."
  exit 1
end
