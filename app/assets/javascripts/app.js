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
      data: {
        match: {
          player1: match.get('player1').id,
          player2: match.get('player2').id
        } 
      }
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
  match: null,
  score1: 0,
  score2: 0,
  maxScore: 21,
  totalScore: 0,
  createdAt: '',

  finished: function() {
    return ((this.get('score1') >= this.get('maxScore') || this.get('score2') >= this.get('maxScore')) 
      && Math.abs(this.get('score1') - this.get('score2')) > 1);
  }.property('score1',
    'score2',
    'maxScore'),

  scoreChanged: function() {
    if (this.get('finished') === true)
    {
      this.switchServer();
      this.save();
    }
  }.observes('score1', 'score2'),

  pointWon: function(event) {
    this.incrementProperty('totalScore');

    if (this.get('totalScore') % 5 === 0) {
      this.switchServer();
    }

    if ($(event.target).is('.score-1')) {
      this.incrementProperty('score1');
    }
    else {
      this.incrementProperty('score2');
    }
  },

  save: function() {
    $.ajax({
      url: '/games.json',
      type: "POST",
      context: this,
      data: {
        game: {
          match_id: this.get('match').id,
          score1: this.get('score1'),
          score2: this.get('score2')
        }
      }
    }).done(function(resp) {
      // Reset the score properties of the game
      this.setProperties({
        totalScore: 0,
        score1: 0,
        score2: 0
      });
    });
  },

  switchServer: function() {
    if ($('.score-1').is('.serving')) {
      $('.score-1').removeClass('serving');
      $('.score-2').addClass('serving');
    } else {
      $('.score-2').removeClass('serving');
      $('.score-1').addClass('serving');
    }
  }
});

App.Game.reopenClass({
  findAll: function() {
    var games = [];

    $.getJSON('/games.json', function(data) {
      $.each(data, function(i, value) {
        console.log(value);

        var game = App.Game.create({
          match: App.Match.create({
            player1: App.Player.create(value.match.p1),
            player2: App.Player.create(value.match.p2),
          }),
          score1: value.score1,
          score2: value.score2,
          createdAt: value.created_at
        });

        console.log(game);
        games.addObject(game);
      });
    });

    return games;
  }
});

/* Controllers */

App.ApplicationController = Em.Controller.extend();
App.StartController = Em.Controller.extend();
App.GameController = Em.Controller.extend();
App.GameResultController = Em.Controller.extend();
App.ResultsController = Em.ArrayController.extend();
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
      m.set('player1', context.context);
    }
    else {
      m.set('player2', context.context);
    }

    console.log(context.context)

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
  enter: function(router) {},

  exit: function(router) {}
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

      results: Ember.Route.transitionTo('results'),

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('start');
      }
    }),

    game: App.BaseRoute.extend({
      route: '/game',

      enter: function(router, context) {
        router.get('gameController').set('game', App.Game.create({
          match: router.get('applicationController.match')
        }));

        router.get('gameController').set('match', router.get('applicationController.match'));

        router.get('applicationController').set('playingGame', true);
      },

      finishMatch: function(router, context) {
        App.Match.finished(router.get('applicationController.match'));
      },

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('game');
      }
    }),

    results: App.BaseRoute.extend({
      route: '/results',

      back: Ember.Route.transitionTo('play'),

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('results', App.Game.findAll());
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
