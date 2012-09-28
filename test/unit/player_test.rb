require 'test_helper'

class PlayerTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "should not save a player without a first name" do
    player = Player.new
    assert !player.save
  end

end
