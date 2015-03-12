/*
* Publications: Example
* Data publications for the Example collection.
*/

Meteor.publish('posts', function(slug){
  // If we have a slug, make sure we check it. This allows to use our publication
  // twice by saying "if we're passing a slug" (meaning we're on a single post),
  // "go ahead and look up that individual post. Otherwise, just give me all of
  // the posts." We *could* improve this further using something like pagination
  // wherein we also return only a fixed number of posts based on the current
  // page the user is on.
  slug ? check(slug, String) : null;
  var data = slug ? Posts.find({"slug": slug}) : Posts.find({});
  if (data) {
    return data;
  }
  this.ready();
});
