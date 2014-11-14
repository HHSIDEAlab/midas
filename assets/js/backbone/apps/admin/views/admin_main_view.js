define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'admin_user_view',
  'admin_tag_view',
  'admin_dashboard_view',
  'text!admin_main_template',
], function ($, _, Backbone, utils, AdminUserView, AdminTagView, AdminDashboardView, AdminMainTemplate) {

  var AdminMainView = Backbone.View.extend({

    events: {
      'click .link-admin'             : 'link'
    },

    initialize: function (options) {
      this.options = options;
    },

    render: function () {
      var data = {

      };
      var template = _.template(AdminMainTemplate, data);
      this.$el.html(template);
      this.routeTarget(this.options.action || '');
      return this;
    },

    routeTarget: function (target) {
      if (!target) {
        target = 'dashboard';
      }
      var t = $((this.$("[data-target=" + target + "]"))[0]);
      // remove active classes
      $($(t.parents('ul')[0]).find('li')).removeClass('active');
      // make the current link active
      $(t.parent('li')[0]).addClass('active');
      if (target == 'user') {
        if (!this.adminUserView) {
          this.initializeAdminUserView();
        }
        this.hideOthers();
        this.adminUserView.render();
      } else if (target == 'tag') {
        if (!this.adminTagView) {
          this.initializeAdminTagView();
        }
        this.hideOthers();
        this.adminTagView.render();
      } else if (target == 'dashboard') {
        if (!this.adminDashboardView) {
          this.initializeAdminDashboardView();
        }
        this.hideOthers();
        this.adminDashboardView.render();
      }
    },

    link: function (e) {
      if (e.preventDefault) e.preventDefault();
      var t = $(e.currentTarget);
      this.routeTarget(t.data('target'));
    },

    hideOthers: function () {
      this.$(".admin-container").hide();
    },

    initializeAdminUserView: function () {
      if (this.adminUserView) {
        this.adminUserView.cleanup();
      }
      this.adminUserView = new AdminUserView({
        el: "#admin-user"
      });
    },

    initializeAdminTagView: function () {
      if (this.adminTagView) {
        this.adminTagView.cleanup();
      }
      this.adminTagView = new AdminTagView({
        el: "#admin-tag"
      });
    },

    initializeAdminDashboardView: function () {
      if (this.adminDashboardView) {
        this.adminDashboardView.cleanup();
      }
      this.adminDashboardView = new AdminDashboardView({
        el: "#admin-dashboard"
      });
    },

    cleanup: function () {
      if (this.adminUserView) this.adminUserView.cleanup();
      if (this.adminTagView) this.adminTagView.cleanup();
      if (this.adminDashboardView) this.adminDashboardView.cleanup();
      removeView(this);
    },
  });

  return AdminMainView;
});
