class CurrencyError < StandardError
end

class String
  def is_currency?
    self.gsub(",", "").match(/^\$?\d+(\.\d{2})?$/)
  end

  def to_dollars
    raise CurrencyError, "#{self} is not a currency." unless self.is_currency?
    Integer(self.gsub(",", "").match(/^\$?(\d+)/)[1])
  end
  
  def cap_words
    self.split(' ').map {|w| w.capitalize }.join(' ')
  end
  
end

class Integer
  def to_currency
    dollars = self / 100
    dollars = dollars.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse # Add commas
    "$#{dollars}"
  end
  
  def comma
    self.to_s =~ /([^\.]*)(\..*)?/
    int, dec = $1.reverse, $2 ? $2 : ""
    while int.gsub!(/(,|\.|^)(\d{3})(\d)/, '\1\2,\3')
    end
    int.reverse + dec
  end
end
