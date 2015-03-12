/*
* UI Helpers
* Define UI helpers for common template functionality.
*/

/*
* Current Route
* Return an active class if the currentRoute session variable name
* (set in the appropriate file in /client/routes/) is equal to the name passed
* to the helper in the template.
*/

UI.registerHelper('currentRoute', function(route){
  return Session.equals('currentRoute', route) ? 'active' : '';
});

/*
* Truncate String
* Take the passed string and character count, returning the truncated string.
*/

UI.registerHelper('truncateString', function(string, characters){
  if (string.length > characters) {
    var truncated = string.substring(0, characters);
    return truncated + "...";
  } else {
    return string;
  }
});

/*
* Epoch to String
* Convert a UNIX epoch string to human readable time.
*/

UI.registerHelper('epochToString', function(timestamp){
  if (timestamp){
    var length = timestamp.toString().length;
    if ( length == 10 ) {
      return moment.unix(timestamp).format("MMMM Do, YYYY");
    } else {
      return moment.unix(timestamp / 1000).format("MMMM Do, YYYY");
    }
  }
});
