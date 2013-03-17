class BudgetUs < Sinatra::Base

  get "/submitIncome" do
  
    income = params[:income]
    income = (income.gsub(/[^0-9.]/,'')).to_i
    flash[:value] = income
    raw_income = income
    income = raw_income-5950 #for deductions
    

    tax_thresholds = [0,8700,35350,85650,178650,388350,0]
    tax_rates = [0.10,0.15,0.25,0.28,0.33,0.35]
    federal_income_tax = 0
    index = 1
    
    loop_array = [8700,35350,85650,178650,388350,0]
    loop_array.each do |threshold|
      if index <= 5
        federal_income_tax+=([threshold,income].min-tax_thresholds[index-1])*tax_rates[index-1] 
        index+=1
        if [threshold,income].min == income
          break
        end
      else
        federal_income_tax+=(income-tax_thresholds[5])*tax_rates[5]
      end
      
      
    end
  
    ss_tax = [(0.042*([raw_income,110100].min)),0].max
    medicare_tax = [(0.0145*([raw_income,110100].min)),0].max
    federal_income_tax = [federal_income_tax,0].max
    puts "tax here: #{federal_income_tax}"

    erb :index, :locals=>{:federal_tax => federal_income_tax.round, :ss_tax => ss_tax.round, :medicare_tax => medicare_tax.round}
   
  end
end