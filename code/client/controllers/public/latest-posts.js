/*
* Controller: Latest Posts
* Template: /client/views/public/latest-posts.html
*/

/*
* Helpers
*/

Template.latestPosts.helpers({
  posts: function(){
    var getPosts = Posts.find({}, {sort: {"date": -1}});
    if (getPosts) {
      return getPosts;
    }
  }
});
