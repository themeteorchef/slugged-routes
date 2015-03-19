#### Getting Started
Although we won't cover its usage in this recipe, the only additional package being added to this recipe outside of those found in [Base](https://github.com/themeteorchef/base) (the boilerplate kit used here on The Meteor Chef) is the [`momentjs:moment`](https://atmospherejs.com/momentjs/moment) package. In order to get all of the packages you'll need, it's recommended that you start with [a clone of this recipe's source](https://github.com/themeteorchef/slugged-routes), or take a look at the ["Packages Included"](https://github.com/themeteorchef/base#packages-included) list for Base over on GitHub.

#### Pretty Permalinks
Our site, Command Module, wants to improve how their articles are linked. By default, the route for their articles is based on the ID of the document in their `Posts` collection (e.g., `http://commandmodule.io/posts/1234567890`). Instead, we're looking to get their routes set up to use pretty permalinks, or URLs based on the actual _title_ of the post: `http://commandmodule.io/posts/awesome-spaceship-pictures`. How do we do it?

<div class="note">
  <h3>A quick note</h3>
  <p>Keep in mind, we're assuming that a Posts collection already exists so we'll skip creating that. If you'd like to see how this is defined, take a look at our definition in <a href="https://github.com/themeteorchef/slugged-routes/blob/master/code/collections/posts.js">/collections/posts.js</a></p>
</div>

##### Setting Up Our Routes
We need to start by setting up our routes to accept _slugs_ instead of ID's. Let's take a look at our `/client/routes/routes-public.js` file first.

<p class="block-header">/client/routes/routes-public.js</p>
```.lang-javascript
Router.route('singlePost', {
  name: 'post.show',
  path: '/posts/:slug',
  template: 'singlePost',
  subscriptions: function() {
    return Meteor.subscribe('singlePost', this.params.slug);
  },
  data: function() {
    var post = Posts.findOne({"slug": this.params.slug});
    if (post) {
      return post;
    }
  },
  onBeforeAction: function() {
    Session.set('currentRoute', null);
    Session.set('isSinglePost', true);
    this.next();
  }
});
```

Let's start by looking at the `path` option on our route definition. Here, we're telling Iron Router to make a route available in our application at `http://localhost:3000/posts/:slug`. The part we want to pay attention to is `:slug`. What the heck is that? Whenever we prefix a part of our URL with a colon `:name` in our path, Iron Router knows to expect a _dynamic_ or changing piece of information there (also known as a [route parameter](https://github.com/iron-meteor/iron-router/blob/devel/Guide.md#route-parameters)).

What's cool about this is that we can put any name we want here. So, `:slug` could also be `:taco`, `:pizza`, or `:lasagna`. The _name_ doesn't matter, just that it's unique in the context of this specific path. So, we want to avoid paths like `/posts/:slug/post/:slug`. We can only use that parameter _once_ in a single path.

<div class="note">
  <h3>A quick note</h3>
  <p>This does not mean that you can't use the same parameter name in different paths. For example, if we have two separate routes `/posts/:slug` and `/post/:slug`, both are acceptable.</p>
</div>

Okay, we've got our path...now what? Next, hop down to the `subscriptions` option on our route. This option allows us to load in our data subscriptions _before_ our route actually loads. You may have done this before using Iron Router's `waitOn` option. These two functions (`subscriptions` and `waitOn`) are pretty much identical, except that `subscriptions` acts as a pseudonym and is intended only for data subscriptions. Phew. Make sense?

<p class="block-header">/client/routes/routes-public.js</p>
```.lang-javascript
Router.route('singlePost', {
  [...]
  subscriptions: function() {
    return Meteor.subscribe('singlePost', this.params.slug);
  },
  [...]
});
```

Notice that in our subscription, we're passing something weird as an argument `this.params.slug`. Here, we're hooking into our current route `this` and looking at its `params` object. With that, we take a look at the `slug` key. See what's happening here? The `slug` token here is mapped to the `:slug` parameter in our route. Said another way, whatever gets passed to the URL at that position will be made available at `this.params.slug`.

For example if we have a URL like `http://localhost:3000/posts/doughnuts-are-rad`, we can now expect `this.params.slug` to return the string `"donughts-are-rad"`. Pretty cool, right? Keep in mind, too, that our param can be any name we'd like, so if we update our path to be `/posts/:taco`, we could get the value by accessing `this.params.taco`. Woah smokies!

Okay so we're subscribing to `singlePost` and passing it the slug from our URL, but what exactly does this all mean? Let's hop over `/server/publications/posts.js` and take a look at the publication we're trying to connect to.

<p class="block-header">/server/publications/posts.js</p>
```.lang-javascript
Meteor.publish('singlePost', function(slug){
  check(slug, String);
  var data = Posts.find({"slug": slug});
  if (data) {
    return data;
  }
  this.ready();
});
```

See it coming together? Here, we're defining our publication `singlePost` and accepting `slug` as an argument. Again, keep in mind that `slug` as our argument name is arbitrary. We're using this here to keep everything clear, but this could just as easily be `permalink`. Inside of our publication, we start by checking our `slug` to make sure it's a string and once we're sure that it is, we do a lookup on our `Posts` collection.

Note that here, where we may have simply passed an ID to our `find()` before, we're making use of our slug `Posts.find({"slug": slug});`. This is telling MongoDB to find a _single_ document where the key `slug` is equal to the `slug` we've passed over from our route's path. We do this not only because we want to find this specific document, but also because this ensures this is the _only_ post being sent down the wire to the client. If we were to just do `Posts.find()` our code would technically still work. In our version, though, we're limiting what we're pulling out of the database to make our code a little more efficient.

Finally, we tell our publication to return the document it finds (if it finds one). Lastly, we return `this.ready()` as a precaution to complete our subscription in the event that a document isn't found. Per the [Meteor documentation]():

> Informs the subscriber that an initial, complete snapshot of the record set has been sent. This will trigger a call on the client to the onReady callback passed to  Meteor.subscribe, if any.

We're not using a callback in our subscriptions, but it's good to keep this as a part of your publication patterns just in case.

Awesome! So now we've got our publication wired to our subscription and we should have some data flowing to our template. But wait...what data? Ah ha! Let's jump back to our route definition real quick and then we'll see how all of this works.

##### Using the `data` Option
Back in our `singlePost` route definition, we can see that we're using `Posts.findOne()`.

<p class="block-header">/client/routes/routes-public.js</p>
```.lang-javascript
Router.route('singlePost', {
  [...]
  data: function() {
    var post = Posts.findOne({"slug": this.params.slug});
    if (post) {
      return post;
    }
  },
  [...]
});
```

Here, we're making use of `this.params.slug` _again_, this time allowing us to do a lookup on our `Posts` collection. But wait...we just did this in our publication, didn't we? Yes, however, here we're looking at the data that's been sent _to_ the client via our publication. If our publication didn't exist, `Posts.findOne()` would return nothing. The `data` option that we're looking at our route is given to us as a convenience from Iron Router. Using the `data` option here is equivalent to writing a helper like:

```.lang-javascript
  Template.post.helpers({
    post: function() {
      // We could use a Session variable to get our postId here set in our router.
      // e.g. var postSlug = Session.get("currentPostSlug");
      var post = Posts.findOne({"slug": postSlug});
      if (post) {
        return post;
      }
    }
  });
```

Neat, huh? Thanks to the `data` option, we can skip all of this! Now when we load up our template, we'll see our post. For context, let's take a look at our `post` template and talk about how it works.

<p class="block-header">/client/views/public/post.html</p>
```.lang-markup
<template name="post">
  <article class="post">
    <h2 class="post-title"><a href="{{#unless single}}{{pathFor route='post.show' slug=slug}}{{else}}#{{/unless}}">{{title}}</a></h2>
    <h4 class="post-meta">{{epochToString date}} by {{author}}</h4>
    {{#unless single}}
      {{{truncateString content 300}}}
    {{else}}
      {{{content}}}
    {{/unless}}
  </article>
</template>
````

We've got a few things going on here, so let's step through it. First, it's important to note that our `post` template is being used in two places: in the `latestPosts` template and the `singlePost` template. We're doing this to be a bit more economical with our templates and to avoid repeating ourselves. To get away with this, we've defined a helper `single` to let us know whether or not we're looking at a "single" post.

This mostly comes into play in respect to how we link our title. If we take a look at the `<a>` tag inside of our `<h2 class="post-title">` element, we can see something going on:

<p class="block-header">/client/views/public/post.html</p>
```.lang-markup
<h2 class="post-title"><a href="{{#unless single}}{{pathFor route='post.show' slug=slug}}{{else}}#{{/unless}}">{{title}}</a></h2>
```

Here, we're making use of Handlebars' `{{#unless}}` block to say "unless we're on a single post page, return a hash (#). Otherwise, return the URL for this post." Recall that because we're using our `post` template both on the Latest Posts page and as a single post, we want to ensure that we're only linking _to_ our post when we're not already viewing it. This block makes sure that the link on our post is only present if we're _not_ on the single post view.

Before we move on, let's call attention to _how_ we're linking to our post.

<p class="block-header">/client/views/public/post.html</p>
```.lang-markup
{{pathFor route='post.show' slug=slug}}
```

Oh, Iron Router, you're so sweet to us. Here, we can see that we're making use of Iron Router's `{{pathFor}}` helper and setting a few arguments. What's unique about this usage is that usually we'll use the `{{pathFor}}` helper by just passing the title of our route. For example, we have our route `singlePost`, so traditionally we'd call `{{pathFor 'singlePost'}}`. Instead, here, we're being specific and setting `route='post.show'`. What gives?

This will make a little more sense later, but the point of this is that we're using a _named_ route `post.show` instead of a route title. We're also passing `slug=slug`. This is saying that we want to set our `:slug` parameter equal to the `slug` value on our post. Our template knows about this `slug` value because we made the post's data available using the `data` option on our route. [No way](http://media.giphy.com/media/JMa0ue6qCey1a/giphy.gif). _Yes way_. Cool, eh?

Now, hold your hat. This probably won't make sense for just a little while longer. We've got one big question mark...how do we get this data into the database?

#### Sanitizing Slugs and Inserting Data
This is where we get into the meat of this recipe. Now that we have our template and route wired up to display our data, let's actually get some data into the database. In order to do this, we've set up a template called `addPost` with a form we can use to write up our post.

<p class="block-header">/client/views/authenticated/add-post.html</p>
```.lang-markup
<template name="addPost">
  <div class="row">
    <div class="col-xs-12 col-md-6 col-md-offset-3">
      <h3 class="page-header">Add a Post</h3>
      <form id="add-post">
        <div class="form-group">
          <input type="text" name="title" class="form-control" placeholder="Post Title">
        </div>
        <div class="form-group">
          <div class="input-group">
            <div class="input-group-addon">{{currentUrl}}/posts/</div>
            <input type="text" disabled name="slug" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <textarea name="content" class="form-control" placeholder="Type your post here..."></textarea>
        </div>
        <div class="form-group">
          <div class="input-group">
            <div class="input-group-addon">Author</div>
            <input type="text" name="author" class="form-control" placeholder="George Jetson" value="George Jetson">
          </div>
        </div>
        <input type="submit" class="btn btn-success" value="Blast Off">
      </form>
    </div>
  </div>
</template>
```

Pretty simple right? We've got a basic form setup to take in our data, but we also have something special (albeit totally unnecessary) going on. As we'll learn, our post's slug is automatically generated. Because of this, it's important to add context to our field. Here, we do this with a helper we've defined `{{currentUrl}}` which is equal the value of `window.location.origin`. We don't _need_ to do this, but it's a nice UX touch so our user knows where their post is actually being published. Okay. Let's see how this template is actually wired up.

<p class="block-header">/client/controllers/authenticated/add-post.js</p>
```.lang-javascript
Template.addPost.events({
  'submit form': function(e) {
    e.preventDefault();
  },
  'blur [name="title"]': function() {
    var form  = $("#add-post"),
        title = form.find("[name='title']"),
        slug  = form.find("[name='slug']");
    var isValid = title.valid();
    if (isValid) {
      var formatted = formatSlug(title.val())
      slug.val(formatted);
    } else {
      slug.val("");
    }
  }
});
```

First, we start by looking at our the events for our `addPost` template. Because we'll be using some validation on our form (so cool, get excited), we need to make sure that our form's standard submit functionality is disabled. We achieve this by saying "when our form is submitted prevent the default function." Easy peasy. Next, we get a little crafty. Here, we're watching the `blur` event on our `name="title"` input. What we want to do here is say "when the user changes the post's title, update our slug field with the properly formatted slug." Okay...but how do we get the slug?

##### Creating the `formatSlug` Function
In order to generate our slug, we'll need to do a bit of processing on the title our user types in. Because we'll be doing this multiple times, we can set up a helper function so we don't need to repeat the same work over and over. Let's take a look.

<p class="block-header">/client/helpers/helper-functions.js</p>
```.lang-javascript
formatSlug = function(value) {
var formatted = value
                .toLowerCase()
                .replace(/ /g,'-')
                .replace(/[-]+/g, '-')
                .replace(/[^\w\x80-\xFF-]+/g,'');
return formatted;
}
```

What in the _hell_ is this gibberish? Cool your jets, let's walk through it. So, because our user could technically write _anything_ into the title input, we need to do a bit of sanitization or "clean up" of what they send us. To do that, we need a way to inspect what they've typed into the input. How do we do it? Regular expressions! Ack!

Although regular expression sounds like some sort of fiber supplement for the 50 plus crowd, it's actually a geeky way to test or "match" certain patterns in our data. In our case, we want to know when certain characters appear in our title string. Specifically, we want to remove anything that isn't an alphanumeric character (abc, 123) or a non-english character (åéîøü). Additionally, we want to convert all of the spaces in our string to be hyphens. So, if our user passes `Hey this is&#%*@%*#@% my blog post` we can get back `hey-this-is-my-blog-post`.

<div class="note">
  <h3>A quick note</h3>
  <p>Writing and debugging regular expressions are about as fun as getting in a bar fight. What you see above was crafted from a fair amount of Stack Overflow-ing and luck. I've tested this a fair amount, but keep in mind that certain patterns or characters may not be covered.</p>
</div>

Okay so how exactly does this work? First, we take our passed `value` argument (we set this whenever we call our `formatSlug()` function, equal to our post title) and conver it to lower case `toLowerCase()`. This helps us take a string like `WhY iN tHe HeLl wOuLd I TiTlE My PoSt LiKe THIS` and turn it into `why in the hell would i title my post like this`. Next, we look at the string and replace any spaces with a hyphen `-` (note, the `/g` means global, or, whenever a space occurs anywhere in our string).

After that, we replace any instances of two or more hyphens, e.g., `we--dontt-want----to-have-this` but rather `we-do-want-to-have-this`). Lastly, for all the chips, we run a monster regex (dork slang for regular expression, get into it) that says "replace any non-alphanumeric characters, but exclude the characters in the range of x80 to xFF (non-english characters)." Now, as far as I'm concerned this may as well be a [crop circle](https://youtu.be/JKDuTwUvzpI?t=1h18s). It _does work_, but as more seasoned developers will tell you, regular expressions are finicky. This should take out 99% of use cases, but make sure to put it through the paces first before putting it into production.

So, after all this hullabaloo, we get back our string `formatted-just-like-this`.

##### Validating Our Slug
Back in our `addPost` controller, let's shift our focus to the validation step. This is really cool.

<p class="block-header">/client/controllers/authenticated/add-post.js</p>
```.lang-javascript
Template.addPost.onRendered(function() {
  $("#add-post").validate({
    rules: {
      title: {
        required: true,
        postExists: true
      },
      slug: {
        required: true,
        postExists: true
      },
      content: {
        required: true
      }
    },
    messages: {
      title: {
        required: "Don't forget a title!",
        postExists: "Hmm, it looks like a post with that title already exists!"
      },
      slug: {
        required: "A slug is required"
      },
      content: {
        required: "That's not much of a post!"
      }
    },
    submitHandler: function() {
      var form  = $("#add-post");
      var post = {
        title: form.find("[name='title']").val(),
        slug: form.find("[name='slug']").val(),
        content: form.find("[name='content']").val(),
        author: form.find("[name='author']").val()
      }

      Meteor.call('insertPost', post, function(error, response){
        if (error){
          Bert.alert(error.reason, "danger");
        } else {
          Bert.alert("Great! Your post was added to the site.", "success");
          Router.go("post.show", {slug: post.slug});
        }
      });
    }
  });
});
```

Pretty basic. What we're doing here is validating our form to make sure that our data exists and once our form is valid, we call to insert our post on the server. Neat and tidy. But look carefully at our `rules` object in our validation. Here, we've added a custom validator for our form field to determine whether or not our post already exists. Say what? As a UX touch and for our own sanity, we're checking whether or not the passed title's slug equivalent _already exists in the database_. Woah! Yeah. Seriously. Let's take a look at our custom validator.

<p class="block-header">/client/helpers/custom-validation.js</p>
```.lang-javascript
$.validator.addMethod("postExists", function(value){
  var formatted = formatSlug(value);
  var unique    = Posts.findOne({"slug": formatted}, {fields: {"slug": 1}});
  return unique ? false : true;
});
```

Some of this should look familiar. First, keep in mind that we're picking up the `$.validator.addMethod` function via the `themeteorchef:jquery-validation` package. Inside, we're taking the value passed (in this case the post title) and making use of our `formatSlug()` function from earlier (DRY!) and then passing that value to a `findOne()` lookup for that `slug` in our `Posts` collection. If we find a post set on `unique` we return `false` meaning "no, this is not a unique post" and `true` if it is unique. Cool, eh? When this fails, we display a message to our user letting them know that the post already exists! This helps us skip the need for checking whether a post is unique on the server. Gasp! Only client side validation?!

We're being "naive" on purpose here, but you can make a choice for yourself. If you're confused, it's known as a good security practice to run _both_ client side and server side validation when it comes to your data. In our case, the server side validation would do the exact same thing as our client side. The difference [as described in this Stack Overflow post](http://stackoverflow.com/a/162579) is that we might introduce a security hole wherein a user could override our client side validation anyway and insert a duplicate post. Considering the nature of our app this double validation isn't a priority, but **it's important to keep this in mind depending on the nature of your application**.

Cool...so we've got this field validated. Now what? Real quick, let's rewind back to our blur event for our title field so we can some serious dorkery going on.

<p class="block-header">/client/controllers/authenticated/add-post.js</p>
```.lang-javascript
Template.addPost.events({
  'blur [name="title"]': function() {
    var form  = $("#add-post"),
        title = form.find("[name='title']"),
        slug  = form.find("[name='slug']");
    var isValid = title.valid();
    if (isValid) {
      var formatted = formatSlug(title.val())
      slug.val(formatted);
    } else {
      slug.val("");
    }
  }
});
```

We want to call attention our `isValid` variable. What this is doing is looking at our `[name="title"]` field on our form and check whether or not our validation says it's valid (i.e., does the field have a value and is the post title unique). To safeguard our slug field and save us a few processes, we prevent updating our `[name='slug']` field until we're _certain_ that our title field is valid. Pretty cool, yeah? Okay. Let's zip back up to our `submitHandler` callback in our validation.

<p class="block-header">/client/controllers/authenticated/add-post.js</p>
```.lang-javascript
Template.addPost.onRendered(function() {
  $("#add-post").validate({
    [...]
    submitHandler: function() {
      var form  = $("#add-post");
      var post = {
        title: form.find("[name='title']").val(),
        slug: form.find("[name='slug']").val(),
        content: form.find("[name='content']").val(),
        author: form.find("[name='author']").val()
      }

      Meteor.call('insertPost', post, function(error, response){
        if (error){
          Bert.alert(error.reason, "danger");
        } else {
          Bert.alert("Great! Your post was added to the site.", "success");
          Router.go("post.show", {slug: post.slug});
        }
      });
    }
  });
});
```

Simple dimple. We grab our form field values and toss our post to the server to insert. One thing, though, that we hinted at earlier but haven't covered yet: our named route. Notice that in the success callback of our method, we're using Iron Router's `Router.go()` method to take our user to their new post's single page. Here, we make reference to our named route `post.show` and then pass an object with one key `slug` set equal to the value of our form's `[name="slug"]` field. Why do we do it this way? For convenience and resilience!

Another version of this method call might look like `Router.go("/posts/" + post.slug)`. The difference? Instead of hard coding our route into our logic, with a named route, we could change our path to anything we'd like (e.g., `/tacos/:slug`) and keep our `Router.go()` the same as long as we leave our `:slug` parameter name the same. Neat! The object convention here just tells Iron Router to set the `:slug` parameter value equal to our new slug value so our user is redirected to the right page. Hot diggity dog, right?

Hey you...guess what? We're done! With our posts inserted into the database, we now have slugged routes instead of IDs.

Smell those SEO bucks. Smell them!!
