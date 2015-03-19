/*
* Controller: Post
* Template: /client/views/public/post.html
*/

/*
* Helpers
*/

Template.post.helpers({
  single: function(){
    return Session.get("isSinglePost");
  }
});
