/*
* Methods: Insert - Posts
* A method used for inserting Posts into the database.
*/

Meteor.methods({
  insertPost: function(post){
    // Check the argument. Assuming an Object type here.
    check(post, {
      title: String,
      slug: String,
      content: String,
      author: String
    });

    // Set a new date for our post.
    post.date = (new Date()).getTime();

    // Perform the insert.
    try {
      var postId = Posts.insert(post);
      return postId;
    } catch(exception) {
      // If an error occurs, return it to the client.
      return exception;
    }
  }
});
