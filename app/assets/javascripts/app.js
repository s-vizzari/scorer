/* Vars */

$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
  }
});

App = Em.Application.create({
  VERSION: '1.0',
  rootElement: '#app'
});

/* Models */

App.Player = Em.Object.extend();
App.Player.reopenClass({
  allPlayers: [],
  findComplete: function(resp){
    resp.forEach(function(player){
      this.allPlayers.addObject(App.Player.create(player));
    }, this);
  },
  find: function() {
    this.allPlayers = [];
    $.ajax({
      url: '/players.json',
      context: this
    }).done(this.findComplete);
  }
});

App.Team = Em.Object.extend({
  players: [],
  full: function() {
    return players.length === 2;
  }.property('players'),
  ok: function() {
    return players.length >= 1;
  }.property('players')
});

App.Match = Em.Object.extend({
  games: [],
  player1: 1,
  player2: 2
});

App.Match.reopenClass({
  started: function(match) {
    $.ajax({
      url: '/matches.json',
      type: 'POST',
      data: { match: match.getProperties('player1', 'player2') }
    }).done(function(resp) {
      match.set('id', resp.id);
      App.router.transitionTo('game');
    });
  },
  finished: function(match) {
    $.ajax({
      url: '/matches/'+match.get('id')+'.json',
      type: "PUT",
      data: { match: { finished: true } }
    }).fail(function() {
      console.log('That\'s a fail!');
    }).done(function(resp) {
      console.log('We just finished that game!');
      App.router.transitionTo('play');
    })
  }
});

App.Game = Em.Object.extend({
  match_id: 1,
  score1: 0,
  score2: 0,
  maxScore: 11,
  finished: function() {
    return (this.get('score1') === this.get('maxScore') ||
      this.get('score2') === this.get('maxScore'));
  }.property('score1',
    'score2',
    'maxScore'),
  scoreChanged: function() {
    if (this.get('finished') === true)
    {
      App.Game.save(App.get('router.gameController.game'));
    }
  }.observes('score1',
    'score2')
});

App.Game.reopenClass({
  save: function(game) {
    $.ajax({
      url: '/games.json',
      type: "POST",
      data: {game: game.getProperties('match_id', 'score1', 'score2')}
    }).done(function(resp) {
      // Reset the score properties of the game
      game.setProperties({
        score1: 0,
        score2: 0
      });
    });
  }
});

/* Controllers */

App.ApplicationController = Em.Controller.extend();
App.StartController = Em.Controller.extend();
App.GameController = Em.Controller.extend();
App.GameResultController = Em.Controller.extend();
App.ResultsController = Em.Controller.extend();
App.LeadersController = Em.Controller.extend();
App.MessageController = Em.Controller.extend();

/* Views */

App.ApplicationView = Em.View.extend({
  templateName: 'app-tpl',
  classNames: ['app-view'],
  classNameBindings: ['controller.playingGame:playing'],
  playingGame: false,
  eventManager: Em.Object.create({
    finishMatch: function(evt, view) {
      console.log('Yay!');
    }
  })
});
App.ATeamView = Em.View.extend({
  templateName: 'select-team-tpl',
  niceIndex: function() {
    return this.get('contentIndex') + 1;
  }.property('contentIndex'),
  players: [
    App.Player.create({handle:'svizzari'}),
    App.Player.create({handle:'jswsj'}),
    App.Player.create({handle:'thebean'})
  ]
});
App.TeamsView = Em.CollectionView.extend({
  content: [App.Team.create(), App.Team.create()]
});
App.StartView = Em.ContainerView.extend({
  childViews: ['teamsView', 'actionView'],
  teamsView: Em.View.extend({
    template: Em.Handlebars.compile('<div class="row start-game">{{collection App.TeamsView itemViewClass="App.ATeamView"}}</div>')
  }),
  actionView: Em.View.extend({
    layout: Em.Handlebars.compile('<div class="row"><div class="span12">{{yield}}</div></div>'),
    template: Em.Handlebars.compile('<a {{action startGame}} class="btn btn-large">Lets play! <i class="icon-chevron-right"></i></a>')
  })
});
App.GameView = Em.View.extend({
  templateName: 'game-tpl'
});
App.GameResultView = Em.View.extend({
  templateName: 'game-result-tpl'
});
App.ResultsView = Em.View.extend({
  templateName: 'results-tpl'
});
App.LeadersView = Em.View.extend({
  templateName: 'leaders-tpl'
});
App.MessageView = Em.View.extend({
  templateName: 'message-tpl'
});

/* Routes */

App.BaseRoute = Em.Route.extend({
  enter: function(router) {
    /*router.get('applicationController')
      .set('playingGame', false);*/
  },
  exit: function(router) {
    //console.log('Exit route: ' + router.get('currentState.name'));
  }
});

App.Router = Em.Router.extend({
  enableLogging: true,
  root: App.BaseRoute.extend({
    index: App.BaseRoute.extend({
      route: '/',
      redirectsTo: 'play'
    }),
    play: App.BaseRoute.extend({
      route: '/play',
      enter: function(router) {
        // Load the player
        App.Player.find();
      },
      startGame: function(router) {
        var m = App.Match.create()
        router.get('applicationController')
          .set('match', m);
        App.Match.started(m);
      },
      togglePlayer: function(router, context) {
        var $playerBtn = $(context.target);
        if ($playerBtn.is('.disabled')) return;
        $('[data-player-handle="'+$playerBtn.data('playerHandle')+'"]').not($playerBtn).each(function(i, el) {
          $(el).toggleClass('disabled');
        });
        $playerBtn.toggleClass('btn-inverse');
      },
      connectOutlets: function(router) {
        console.log(router.get('applicationController'));
        router.get('applicationController')
          .connectOutlet('start');
      }
    }),
    game: App.BaseRoute.extend({
      route: '/game',
      enter: function(router, context) {
        router.get('gameController')
          .set('game', App.Game.create({
            match_id: router.get('applicationController.match.id')
          }));
        router.get('applicationController')
          .set('playingGame', true);
      },
      finishMatch: function(router, context) {
        App.Match.finished(router.get('applicationController.match'));
      },
      pointWon: function(router, context) {
        var game = router.get('gameController.game');
        if ($(context.target).is('.score-1'))
        {
          game.incrementProperty('score1');
        }
        else
        {
          game.incrementProperty('score2');
        }
      },
      connectOutlets: function(router) {
        router.get('applicationController')
          .connectOutlet('game');
      }
    }),
    results: App.BaseRoute.extend({
      route: '/result/all',
      connectOutlets: function(router) {
        router.get('applicationController')
          .connectOutlet('results');
      }
    }),
    leaders: App.BaseRoute.extend({
      route: '/leaders',
      connectOutlets: function(router) {
        router.get('applicationController')
          .connectOutlet('leaders');
      }
    })
  })
});

App.initialize();

//console.log(App.router)

//module.exports = App;
//module.exports = App;
