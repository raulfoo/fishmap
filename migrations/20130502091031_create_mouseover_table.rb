Sequel.migration do
  up do
    create_table :connections do
    
      String :region_id
      String :region_name
      String :category
      String :partner_name
      String :partner_id
      String :description
      Float :value
      
      index :region_id
      index :category
      index :partner_id
      index :description
      
    end
      
  end

  down do
    drop_table :connections
  end
end
