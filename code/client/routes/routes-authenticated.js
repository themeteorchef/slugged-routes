/*
* Routes: Authenticated
* Routes that are only visible to authenticated users.
*/

Router.route('addPost', {
  path: '/posts/add',
  template: 'addPost',
  subscriptions: function() {
    Meteor.subscribe('posts');
  },
  onBeforeAction: function(){
    Session.set('currentRoute', 'add-post');
    Session.set('isSinglePost', false);
    this.next();
  }
});
