class Game < ActiveRecord::Base
  attr_accessible :score1, :score2, :match_id
  belongs_to :matches
  validates :score1, :presence => true
  validates :score2, :presence => true
  validates :match_id, :presence => true
end
