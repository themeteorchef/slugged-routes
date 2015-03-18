/*
* Routes: Public
* Routes that are visible to all (public) users.
*/

Router.route('latestPosts', {
  path: '/',
  template: 'latestPosts',
  subscriptions: function() {
    Meteor.subscribe('posts');
  },
  onBeforeAction: function(){
    Session.set('currentRoute', 'latest-posts');
    Session.set('isSinglePost', false);
    this.next();
  }
});

Router.route('singlePost', {
  name: 'post.show',
  path: '/posts/:slug',
  template: 'singlePost',
  subscriptions: function() {
    Meteor.subscribe('posts', this.params.slug);
  },
  data: function() {
    var post = Posts.findOne({"slug": this.params.slug});
    if (post) {
      return post;
    }
  },
  onBeforeAction: function() {
    Session.set('currentRoute', null);
    Session.set('isSinglePost', true);
    this.next();
  }
});

Router.route('login', {
  path: '/login',
  template: 'login',
  onBeforeAction: function(){
    Session.set('currentRoute', 'login');
    this.next();
  }
});

Router.route('recover-password', {
  path: '/recover-password',
  template: 'recoverPassword',
  onBeforeAction: function(){
    Session.set('currentRoute', 'recover-password');
    this.next();
  }
});

Router.route('reset-password', {
  path: '/reset-password/:token',
  template: 'resetPassword',
  onBeforeAction: function() {
    Session.set('currentRoute', 'reset-password');
    Session.set('resetPasswordToken', this.params.token);
    this.next();
  }
});
