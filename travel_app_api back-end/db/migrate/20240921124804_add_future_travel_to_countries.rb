class AddFutureTravelToCountries < ActiveRecord::Migration[7.1]
  def change
    add_column :countries, :future_travel, :boolean
  end
end
