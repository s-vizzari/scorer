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

  it("should be zero, then increment correctly", function(){
    var game = App.Game.create();
    expect(game.get('score1')).toBe(0);
    game.incrementProperty('score1');
    game.incrementProperty('score1');
    game.incrementProperty('score1');
    expect(game.get('score1')).toBe(3);
  });

});


describe('A Match', function(){

  it('should exit', function(){
    expect(true).toBe(true);
  });

});

describe('A Player', function(){

});