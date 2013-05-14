Sequel.migration do
  up do
    create_table :thresholds do
    
      String :type
      Float :level_percent
      String :color
      Float :level_value
      
    end
  end

  down do
  
    drop_table :thresholds
    
  end
end
