class Match < ActiveRecord::Base
  attr_accessible :player1, :player2
  has_many :games
  validates :player1, :presence => true
  validates :player2, :presence => true
end
