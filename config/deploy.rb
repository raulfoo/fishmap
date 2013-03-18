def set_application_paths(app)
  set :deploy_to, "/opt/#{app}"
  set :staging_path, "/tmp/#{app}"
  set :local_path, Dir.pwd
  set :release_path, "#{deploy_to}/releases/#{Time.now.strftime("%Y%m%d%H%M")}"
end

def set_common_environment
  env :db_host, "localhost"
  env :db_name, "budgetus"
  env :db_user, "budgetus"
end

set :app, "budgetus"
set_application_paths(app)
set :user, "budgetus"

role :root_user, :user => "root"
role :budgetus_user, :user => "budgetus"

destination :vagrant do
  set :domain, "budgetus-vagrant"
  set_common_environment
  env :rack_env, "production"
  env :port, 8200
end

destination :staging do
  set :app, "budgetus_staging"
  set_application_paths(app)
  set :domain, "173.255.223.11"
  set_common_environment
  env :rack_env, "staging"
  env :db_name, "budgetus_staging"
  env :db_user, "budgetus_staging"
  env :port, 8100
  env :unicorn_workers, 2
  env :s3_bucket, "staging.budgetus.org"
end

destination :prod do
  set :domain, "173.255.223.11"
  set_common_environment
  env :rack_env, "production"
  env :db_name, "budgetus"
  env :db_user, "budgetus"
  env :port, 8200
  env :unicorn_workers, 10
  env :s3_bucket, "budgetus.org"
end

# Load secure credentials
if ENV.has_key?("BUDGETUS_CREDENTIALS") && File.exist?(ENV["BUDGETUS_CREDENTIALS"])
  load ENV["BUDGETUS_CREDENTIALS"]
else
  puts "Unable to locate the file $BUDGETUS_CREDENTIALS. You need this to deploy."
  exit 1
end
