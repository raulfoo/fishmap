Sequel.migration do
  up do
    create_table :descriptions do
      Integer :id
      String :name
      String :description
      
      index :id
      index :name
    end
  end

  down do
    drop_table :descriptions
  end
end
