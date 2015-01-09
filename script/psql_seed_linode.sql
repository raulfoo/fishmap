--to execute type \i script/psql_seed.sql from the psql command line
--THIS ONE IS FOR the LINODE

--delete from splashes;
--delete from connections;
--delete from details;
--delete from thresholds;
--delete from centroids;

copy splashes from '/var/lib/postgresql/fishmap_tables/splash_data2014.txt' delimiters ',' csv;
copy connections from '/var/lib/postgresql/fishmap_tables/mouseover_data2014.txt' delimiters ',' csv;
copy details from '/var/lib/postgresql/fishmap_tables/click_data2014.txt' delimiters ',' csv; --or click_data_all
--copy thresholds from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/splash_thresholds.txt' delimiters ',' csv;
--copy centroids from '/Users/raulfoo/Desktop/FishMap_Scripts/Output/region_centroids.txt' delimiters ',' csv;

copy populations from '/var/lib/postgresql/fishmap_tables/population_dat2014.txt' delimiters ',' csv;


--on linode it will be [copy splashes from '/var/lib/postgresql/fishmap_tables/splash_data.txt' delimiters ',' csv;]
