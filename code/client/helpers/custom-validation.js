/*
* Custom Validation
* Custom validation helpers for our posts.
*/

/*
* Post Exists
* Check whether or not a post already exists in the database by formatting the
* passed title as a slug and looking for it in the Posts collection.
*/
$.validator.addMethod("postExists", function(value){
  // Pass our value to our formatSlug function to get our string formatted.
  var formatted = formatSlug(value);
  // Do a look up on the database for this exact slug.
  var unique    = Posts.findOne({"slug": formatted}, {fields: {"slug": 1}});
  // Return false if we find a post (not unique) and true if we do not (unique).
  return unique ? false : true;
});
