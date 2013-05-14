Sequel.migration do
  up do
    create_table :details do
    
      String :region_id
      String :region_name
      String :category
      String :subset
      String :partner
      String :description
      Float :value
      Float :percent_constrained
      Float :percent_all
      
            
      index :region_id
      index :category
      index :partner
      
    
    end
  end

  down do
    drop_table :details
  end
end
