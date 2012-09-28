require 'test_helper'

class GameTest < ActiveSupport::TestCase
  fixtures :games

  test "should not save game without 2 scores" do
    game = Game.new
    assert !game.save, "Saved the game without a title"
  end

  test "should not save a game without a match_id" do
    game = Game.new(:score1 => "21", :score2 => '13')
    assert !game.save, "Saved the game without a match_id"
  end

  test "should save a game with 2 scores and a match_id" do
    game = Game.new(:match_id => games(:one).match_id, :score1 => games(:one).score1, :score2 => games(:one).score2)
    assert game.save, "Didn't save a game when it should"
  end

end
