class AddFinishedToMatches < ActiveRecord::Migration
  def change
    add_column :matches, :finished, :boolean, :default => false
  end
end
