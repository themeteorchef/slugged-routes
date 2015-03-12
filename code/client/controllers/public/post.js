/*
* Controller: Post
* Template: /client/views/public/post.html
*/

/*
* Helpers
*/

Template.login.helpers({
  single: function(){
    return Session.get("isSinglePost");
  }
});
