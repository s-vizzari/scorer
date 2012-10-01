# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Emanuel', :city => cities.first)

players = Player.create([
  {:id => 1, :first_name => 'Jason', :last_name => 'Smale', :handle => 'jwswj'},
  {:id => 2, :first_name => 'Stefan', :last_name => 'Vizzari', :handle => 'sv'}
])
matches = Match.create([
  {:id => 1, :player1 => 1, :player2 => 2},
  {:id => 2, :player1 => 1, :player2 => 2}
])
games = Game.create([
  {:id => 1, :match_id => 1, :score1 => 12, :score2 => 21},
  {:id => 2, :match_id => 1, :score1 => 10, :score2 => 21}
])