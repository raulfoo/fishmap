Sequel.migration do
  up do
    create_table :populations do
    
      String :region_name
      String :region_id
      Integer :year
      Float :value
      
      index :region_id
      index :year
    end
  end

  down do
  
    drop_table :populations
    
  end
end
