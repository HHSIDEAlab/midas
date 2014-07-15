define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!home_template'
], function ($, _, Backbone, utils, HomeTemplate) {

  var HomeView = Backbone.View.extend({

    events: {
    },

    render: function () {
      var compiledTemplate = _.template(HomeTemplate);
      this.$el.html(compiledTemplate);
      return this;
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return HomeView;
});
