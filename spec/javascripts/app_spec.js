//= require jquery
//= require app


describe("A Game", function() {

  it("should have a match_id", function(){
    var game = App.Game.create();
    expect(game.get('match_id')).toBe(1);
  });

  it("should not be finished until the score reaches 11", function(){
    var game = App.Game.create();
    game.incrementProperty('score1', 4);
    expect(game.get('finished')).toBe(false);
  });

  it("should be finished when the score reaches 11", function(){
    var game = App.Game.create();
    App.get('router')
      .get('gameController')
      .set('game', game);
    game.incrementProperty('score1', 11);
    expect(game.get('finished')).toBe(true);
  });

  it("should be zero, then increment correctly", function(){
    var game = App.Game.create();
    expect(game.get('score1')).toBe(0);
    game.incrementProperty('score1', 3);
    expect(game.get('score1')).toBe(3);
  });

});


describe('A Match', function(){

  it('should exit', function(){
    expect(true).toBe(true);
  });

});

describe('A Player', function(){

  it("should fetch a list of players", function(){

    spyOn(App.Player, 'findComplete').andCallThrough();

    runs(function() {
      App.Player.find();
    });

    waits(500);

    runs(function() {
      expect(App.Player.findComplete).toHaveBeenCalled();
      // expect(App.Player.get('allPlayers').length).toBe(3);
    });

  });

});