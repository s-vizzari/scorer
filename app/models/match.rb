class Match < ActiveRecord::Base
  attr_accessible :player1, :player2
  has_many :games
end
