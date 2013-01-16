class Game < ActiveRecord::Base
  attr_accessible :score1, :score2, :match_id, :winner
  belongs_to :match
  belongs_to :winner, :class_name => "Player", :foreign_key => "winner_id"
  validates :score1, :presence => true
  validates :score2, :presence => true
  validates :match_id, :presence => true
  before_save :set_winner 

  def set_winner
    self.winner = score1 > score2 ? match.p1 : match.p2
  end
end
