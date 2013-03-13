Sequel.migration do
  up do
    create_table :programs do
      
      String :subfunction
      String :agency
      String :bureau
      String :program
      Integer :id, :null => false
      String :spending_category
      Integer :year
      Float :budget_percent
      Float :restrict_percent
      Float :budget_dollar
      String :is_medicare, :null=> false, :default => "f"
      
      index :id
      index :agency
      index :bureau
      index :program
      index :year
      
    end
  end

  down do
    drop_table :programs
  end
end
