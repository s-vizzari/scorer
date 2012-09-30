require 'test_helper'

class PlayerTest < ActiveSupport::TestCase
  fixtures :players

  test "should not save a player without a first name" do
    player = Player.new
    assert !player.save
  end

  test "should not save a player without a last name" do
    player = Player.new(:first_name => players(:stefan).first_name)
    assert !player.save
  end

  test "handle is generated when user saved" do
    player = Player.new(:first_name => players(:stefan).first_name, :last_name => players(:stefan).last_name)
    player.save
    assert_equal( player.handle, "svizzari" )
  end

  test "handle is not changed if present before save" do
    player = Player.new(:first_name => players(:jason).first_name, :last_name => players(:jason).last_name, :handle => players(:jason).handle)
    player.save
    assert_equal( player.handle, "jwswj" )
  end

end
