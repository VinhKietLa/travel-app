class CreateLegendPositions < ActiveRecord::Migration[7.1]
  def change
    create_table :legend_positions do |t|
      t.integer :x
      t.integer :y

      t.timestamps
    end
  end
end
