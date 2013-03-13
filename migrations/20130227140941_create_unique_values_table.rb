Sequel.migration do
  up do
    create_table :unique_searches do
    
      Integer :unique_id
      String :search_name
      String :browse_name
      String :first_browse
      Boolean :search_text
      String :branch_id
      String :trunk_id
      Integer :sort_value
      String :base_level
      String :account_ids1
      String :account_ids2
      String :account_ids3
      String :account_ids4
      String :neighbor_ids
      
      index :unique_id
      index :search_name
      index :browse_name
      index :search_text
      index :sort_value
      index :trunk_id
      
      
    end
  end

  down do
    drop_table :unique_searches
  end
end
