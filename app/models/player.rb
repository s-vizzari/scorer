class Player < ActiveRecord::Base
  attr_accessible :first_name, :handle, :last_name
  has_many :matches
  has_many :games, :through => :matches
  has_many :games_won, :class_name => "Game", :foreign_key => "winner_id"
  validates :first_name, :presence => true
  validates :last_name, :presence => true

  before_save :set_handle

  # If the handle is empty, then use the first letter of the first_name, followed by the last_name.
  def set_handle
    if self[:handle].nil?
      self.handle = self[:first_name].chr.downcase << self[:last_name].downcase
    end
  end

  def win_count
    games_won.size
  end

  def matches
    Match.where("player1 = ? OR player2 = ?", id, id)
  end

  def matches_won
    matches.select do |match|
      self == match.winner
    end
  end
end