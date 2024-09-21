class AddDefaultValueToFutureTravelInCountries < ActiveRecord::Migration[7.1]
  def change
    change_column_default :countries, :future_travel, false
  end
end
