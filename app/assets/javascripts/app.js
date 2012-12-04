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

App.Player = Em.Object.extend({
  fullName: function() {
    return this.get('first_name') + ' ' +  this.get('last_name');
  }.property('first_name', 'last_name')
});

App.Player.reopenClass({
  allPlayers: [],

  findComplete: function(resp){
    resp.forEach(function(player){
      this.allPlayers.addObject(App.Player.create(player));
    }, this);
  },

  find: function() {
    $.ajax({
      url: '/players.json',
      context: this
    }).done(this.findComplete);

    return this.allPlayers;
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
  player1: null,
  player2: null,

  notReady: function() {
    return this.get('player1') === null || this.get('player2') === null;
  }.property('player1', 'player2')
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
      // console.log('That\'s a fail!');
    }).done(function(resp) {
      // console.log('We just finished that game!');
      App.router.transitionTo('play');
    })
  }

});

App.Game = Em.Object.extend({
  match_id: 0,
  score1: 0,
  score2: 0,
  maxScore: 21,

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
  }.observes('score1', 'score2')
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

  playingGame: false
});

App.ATeamView = Em.View.extend({
  templateName: 'select-team-tpl',

  notReadyBinding: 'App.router.applicationController.match.notReady',

  notReadyChanged: function() {
    console.log('changed!');
  }.observes('notReady'),

  niceIndex: function() {
    return this.get('contentIndex') + 1;
  }.property('contentIndex'),

  togglePlayer: function(context) {
    var $playerBtn = $(context.target);
    var m = App.router.get('applicationController.match');

    if ($playerBtn.is('[data-team="team-1"]')) {
      m.set('player1', context.context.get('id'));
    }
    else {
      m.set('player2', context.context.get('id'));
    }

    if ($playerBtn.is('.disabled')) return;

    $playerBtn.closest('ul').find('.btn').removeClass('btn-primary').each(function(i, el) {
      var $el = $(el);
      $('[data-player-handle="'+$el.data('playerHandle')+'"]').not($el).removeClass('disabled');
    });

    $('[data-player-handle="'+$playerBtn.data('playerHandle')+'"]').not($playerBtn).each(function(i, el) {
      $(el).toggleClass('disabled');
    });
    
    $playerBtn.toggleClass('btn-primary');
    $playerBtn.closest('.well').find('.icon-ok-sign').addClass('all-good');
  },

  players: App.Player.find()
});

App.TeamsView = Em.CollectionView.extend({
  content: [App.Team.create(), App.Team.create()]
});

App.StartView = Em.View.extend({
  templateName: 'start-tpl',

  actionView: Em.View.extend({
    classNameBindings: "App.router.applicationController.match.notReady:disabled",

    tagName: "a",

    classNames: "btn btn-large",

    click: function(evt, view) {
      if ($(evt.target).is('.btn') && $(evt.target).not('.disabled')) {
        App.Match.started(App.router.get('applicationController.match'));
      }
    }
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
        router.get('applicationController').set('match', App.Match.create());
      },

      connectOutlets: function(router) {
        router.get('applicationController')
          .connectOutlet('start');
      }
    }),

    game: App.BaseRoute.extend({
      route: '/game',

      enter: function(router, context) {
        router.get('gameController').set('game', App.Game.create({
          match_id: router.get('applicationController.match.id')
        }));

        router.get('applicationController').set('playingGame', true);
      },

      finishMatch: function(router, context) {
        App.Match.finished(router.get('applicationController.match'));
      },

      pointWon: function(router, context) {
        var game = router.get('gameController.game');

        if ($(context.target).is('.score-1')) {
          game.incrementProperty('score1');
        }
        else {
          game.incrementProperty('score2');
        }
      },

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('game');
      }
    }),

    results: App.BaseRoute.extend({
      route: '/result/all',

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('results');
      }
    }),

    leaders: App.BaseRoute.extend({
      route: '/leaders',

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('leaders');
      }
    })
  })
});

App.initialize();
