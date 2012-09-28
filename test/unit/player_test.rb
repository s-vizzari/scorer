require 'test_helper'

class PlayerTest < ActiveSupport::TestCase

  test "should not save a player without a first name" do
    player = Player.new
    assert !player.save
  end

end
