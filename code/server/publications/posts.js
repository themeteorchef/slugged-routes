/*
* Publications: Example
* Data publications for the Example collection.
*/

Meteor.publish('posts', function(){
  var data = Posts.find({});
  if (data) {
    return data;
  }
  return this.ready();
});

Meteor.publish('singlePost', function(slug){
  // Check our slug for the expected type.
  check(slug, String);
  // Find our post in the database with the passed slug.
  var data = Posts.find({"slug": slug});
  if (data) {
    return data;
  }
  return this.ready();
});
