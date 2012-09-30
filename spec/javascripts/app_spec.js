//= require app

describe("A Game", function() {

  it("should have a match_id", function(){
    var game = App.Game.create();
    expect(game.get('match_id')).toBe(1);
  });

  it("should not be finished until the score reaches 11", function(){
    var game = App.Game.create();
    game.incrementProperty('score1');
    game.incrementProperty('score1');
    game.incrementProperty('score1');
    game.incrementProperty('score1');
    expect(game.get('finished')).toBe(false);
  });

});