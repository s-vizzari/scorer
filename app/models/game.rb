class Game < ActiveRecord::Base
  attr_accessible :score1, :score2, :match_id
  belongs_to :matches
end
