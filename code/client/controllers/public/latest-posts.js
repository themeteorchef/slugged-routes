/*
* Controller: Latest Posts
* Template: /client/views/public/latest-posts.html
*/

/*
* Helpers
*/

Template.latestPosts.helpers({
  posts: function(){
    var getPosts = Posts.find();
    if (getPosts) {
      return getPosts;
    }
  }
});
