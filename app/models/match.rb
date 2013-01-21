class Match < ActiveRecord::Base
  attr_accessible :p1, :p2, :player1, :player2, :finished

  has_many :games
  belongs_to :p1, :class_name => 'Player', :foreign_key => 'player1'
  belongs_to :p2, :class_name => 'Player', :foreign_key => 'player2'
  validates :player1, :presence => true
  validates :player2, :presence => true

  def winner
    p1_count, p2_count = 0, 0
    games.each do |game|
      if p1 == game.winner
        p1_count += 1
      else
        p2_count += 1
      end
    end
    p1_count > p2_count ? p1 : p2
  end
end
