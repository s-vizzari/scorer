class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :score1
      t.integer :score2

      t.timestamps
    end
  end
end
