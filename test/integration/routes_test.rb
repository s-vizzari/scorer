require 'test_helper'

class RoutesTest < ActionController::IntegrationTest
  test "route rest" do
    assert_generates "/players", :controller => "players", :action => "index"
  end

end