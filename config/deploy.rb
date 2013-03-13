def set_application_paths(app)
  set :deploy_to, "/opt/#{app}"
  set :staging_path, "/tmp/#{app}"
  set :local_path, Dir.pwd
  set :release_path, "#{deploy_to}/releases/#{Time.now.strftime("%Y%m%d%H%M")}"
end

def set_common_environment
  env :db_host, "localhost"
  env :db_name, "BudgetUs"
  env :db_user, "postgres"
end

set :app, "BudgetUs"
set_application_paths(app)
set :user, "postgres"

role :root_user, :user => "root"
role :BudgetUs_user, :user => "postgres"

destination :vagrant do
  set :domain, "BudgetUs-vagrant"
  set_common_environment
  env :rack_env, "production"
  env :port, 8200
end

destination :staging do
  set :app, "BudgetUs_staging"
  set_application_paths(app)
  set :domain, "50.116.26.92"
  set_common_environment
  env :rack_env, "staging"
  env :db_name, "BudgetUs_staging"
  env :db_user, "BudgetUs_staging"
  env :port, 8100
  env :unicorn_workers, 2
  env :s3_bucket, "staging.budgetus.org"
end

destination :prod do
  set :domain, "50.116.26.92"
  set_common_environment
  env :rack_env, "production"
  env :db_name, "BudgetUs"
  env :db_user, "BudgetUs"
  env :port, 8200
  env :unicorn_workers, 10
  env :s3_bucket, "budgetus.org"
end

#after "deploy:symlink", "deploy:update_crontab"

#namespace :deploy do
#  desc "Update the crontab file"
#  task :update_crontab, :roles => :db do
#    run "cd #{release_path} && whenever --update-crontab #{app}"
#  end
#end

# Load secure credentials
if ENV.has_key?("BudgetUs_CREDENTIALS") && File.exist?(ENV["BudgetUs_CREDENTIALS"])
  load ENV["BudgetUs_CREDENTIALS"]
else
  puts "Unable to locate the file $BudgetUs_CREDENTIALS. You need this to deploy."
  exit 1
end
