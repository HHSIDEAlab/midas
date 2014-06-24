define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!about_template'
], function ($, _, Backbone, utils, AboutTemplate) {

  var AboutView = Backbone.View.extend({

    events: {
    },

    render: function () {
      var self = this;
      var compiledTemplate = _.template(AboutTemplate);
      this.$el.html(compiledTemplate);
    },

    cleanup: function () {	  
      removeView(this);
	  this.$el.html();
    }

  });

  return AboutView;
});
