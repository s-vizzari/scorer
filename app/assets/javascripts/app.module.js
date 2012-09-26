//
//var $ = require('jquery');
//
var A = Em.Application.create({
  VERSION: '1.0',
  rootElement: '#app'
});
/* Models */
A.Player = Em.Object.extend();
A.Player.reopenClass({
  allPlayers: [],
  find: function() {
    $.ajax({
      url: '/players.json',
      context: this
    }).done(function(resp) {
      _.each(resp, function(p){
        this.allPlayers.addObject(A.Player.create(p))
      }, this);
    });
    return this.allPlayers;
  }
});

/* Controllers */
A.ApplicationController = Em.Controller.extend();
A.PlayersController = Em.ArrayController.extend();

/* Views */
A.ApplicationView = Em.View.extend({
  templateName: 'application'
});

A.PlayersView = Em.View.extend({
  templateName: 'players'
})


A.Router = Em.Router.extend({
  root: Em.Route.extend({
    index: Em.Route.extend({
      route: '/',
      redirectsTo: 'players'
    }),
    players: Em.Route.extend({
      route: '/players',
      //showPlayer: Em.Route.transitionTo('player'),
      connectOutlets: function(router){
        router.get('applicationController').connectOutlet('players', A.Player.find());
      }
    }),
    player: Em.Route.extend({
      route: '/player/:id'
    }),
    results: Em.Route.extend({
      route: '/results'
    }),
  })
});
A.initialize();
module.exports = A;