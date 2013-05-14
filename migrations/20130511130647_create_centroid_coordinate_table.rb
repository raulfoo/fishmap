Sequel.migration do
  up do
    create_table :centroids do
    
      String :id
      Float :x_coord
      Float :y_coord
      
    end
  end

  down do
  
    drop_table :centroids
    
  end
end
