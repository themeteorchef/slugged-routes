/*
* Controller: Post
* Template: /client/views/public/post.html
*/

/*
* Created
*/

Template.post.onCreated(function(){
  var slug = Router.current().params.slug;
  this.subscribe('posts', slug);
});

/*
* Helpers
*/

Template.post.helpers({
  single: function(){
    return Session.get("isSinglePost");
  }
});
