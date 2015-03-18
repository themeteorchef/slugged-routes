/*
* Generate Blog Posts
* Creates a collection of blog posts automatically on startup.
*/

generateBlogPosts = function(){
  // Create an array of user accounts.
  var getPosts    = Assets.getText("blog-posts.json"),
      postsToJson = JSON.parse(getPosts);

  // Loop through array of user accounts.
  for(i=0; i < postsToJson.length; i++){
    // Check if the post already exists in the DB.
    var post      = postsToJson[i];
    var checkPost = Posts.findOne({"slug": post.slug});

    // Set a fake date on the post, offset by a day. Since we're storing this
    // as an epoch, we'll use a helper to convert it to human readable text when
    // we're on the client.
    var fakeDate = ( new Date(2015, 2, 18 + i).getTime() / 1000 );
    post.date    = fakeDate;

    // If an existing user is not found, create the account.
    if ( !checkPost ) {
      Posts.insert(post);
    }
  }
}
