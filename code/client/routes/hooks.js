/*
* Route Hooks
* Hook functions for managing user access to routes.
*/

/*
* Define Hook Functions
*/

/*
* Hook: Check if a User is Logged In
* If a user is not logged in and attempts to go to an authenticated route,
* re-route them to the login screen.
*/

checkUserLoggedIn = function(){
  if( !Meteor.loggingIn() && !Meteor.user() ) {
    Router.go('/login');
  } else {
    this.next();
  }
}

/*
* Hook: Check if a User Exists
* If a user is logged in and attempts to go to a public route, re-route
* them to the index path.
*/

userAuthenticated = function(){
  if( !Meteor.loggingIn() && Meteor.user() ){
    Router.go('/');
  } else {
    this.next();
  }
}

/*
* Hook: Reset Scroll
* When moving between routes, reset the scroll position in the browser to zero
* so that if a user was scrolled down on the previous page, changing routes
* resets the scroll to the top.
*/

resetScroll = function(){
  $('body').scrollTop(0);
  this.next();
}

/*
* Run Hooks
*/

Router.onBeforeAction(checkUserLoggedIn, {
  except: [
    'latestPosts',
    'archive',
    'post.show',
    'signup',
    'login',
    'recover-password',
    'reset-password'
  ]
});

Router.onBeforeAction(userAuthenticated, {
  only: [
    'signup',
    'login',
    'recover-password',
    'reset-password'
  ]
});

Router.onBeforeAction(resetScroll);
