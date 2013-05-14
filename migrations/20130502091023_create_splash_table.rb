Sequel.migration do
  up do
    create_table :splashes do
      
      String :region_id
      String :region_name
      String :category
      String :subset
      String :description
      Float :value
      
      index :region_id
      index :category
      index :description
      
    
    end
  end

  down do
    drop_table :splashes
  end
end
