class AddMatchIdToGame < ActiveRecord::Migration
  def change
    add_column :games, :match_id, :integer
  end
end
