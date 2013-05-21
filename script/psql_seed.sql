--to execute type \i script/psql_seed.sql from the psql command line

delete from splashes;
delete from connections;
delete from details;
delete from thresholds;
delete from centroids;

copy splashes from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/splash_data.txt' delimiters ',' csv;
copy connections from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/mouseover_data.txt' delimiters ',' csv;
copy details from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/click_data.txt' delimiters ',' csv; --or click_data_all
copy thresholds from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/splash_thresholds.txt' delimiters ',' csv;
copy centroids from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/region_centroids.txt' delimiters ',' csv;

copy populations from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/population_dat.txt' delimiters ',' csv;


--on linode it will be [copy splashes from '/var/lib/postgresql/fishmap_tables/splash_data.txt' delimiters ',' csv;]
