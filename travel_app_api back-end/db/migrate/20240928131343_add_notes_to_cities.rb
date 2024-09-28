class AddNotesToCities < ActiveRecord::Migration[7.1]
  def change
    add_column :cities, :notes, :text
  end
end
