class CreateCities < ActiveRecord::Migration[7.1]
  def change
    create_table :cities do |t|
      t.string :name
      t.references :country, null: false, foreign_key: true
      t.text :places_stayed
      t.text :recommendations
      t.text :highlights
      t.text :dislikes

      t.timestamps
    end
  end
end
