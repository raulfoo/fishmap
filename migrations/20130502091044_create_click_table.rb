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
      Float :region_percent
      Float :type_percent
      Float :partner_percent
      Integer :year
      
            
      index :region_id
      index :category
      index :partner
      index :year
      
    
    end
  end

  down do
    drop_table :details
  end
end
