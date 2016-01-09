/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
APP.Main = (function() {

  var LAZY_LOAD_THRESHOLD = 300;
  var $ = document.querySelector.bind(document);

  var stories = null;
  var storyStart = 0;
  var count = 100;
  var main = $('main');
  var inDetails = false;
  var storyLoadCount = 0;
  var testcount = 0;
  //Created a new object to store the stories values as key-pair
  var storyobject = {};
  var testobject = {};
  var result = {};
  var localeData = {
    data: {
      intl: {
        locales: 'en-US'
      }
    }
  };

  var tmplStory = $('#tmpl-story').textContent;
  var tmplStoryDetails = $('#tmpl-story-details').textContent;
  var tmplStoryDetailsComment = $('#tmpl-story-details-comment').textContent;

  if (typeof HandlebarsIntl !== 'undefined') {
    HandlebarsIntl.registerWith(Handlebars);
  } else {

    // Remove references to formatRelative, because Intl isn't supported.
    var intlRelative = /, {{ formatRelative time }}/;
    tmplStory = tmplStory.replace(intlRelative, '');
    tmplStoryDetails = tmplStoryDetails.replace(intlRelative, '');
    tmplStoryDetailsComment = tmplStoryDetailsComment.replace(intlRelative, '');
  }

  var storyTemplate =
      Handlebars.compile(tmplStory);
  var storyDetailsTemplate =
      Handlebars.compile(tmplStoryDetails);
  var storyDetailsCommentTemplate =
      Handlebars.compile(tmplStoryDetailsComment);

  /**
   * As every single story arrives in shove its
   * content in at that exact moment. Feels like something
   * that should really be handled more delicately, and
   * probably in a requestAnimationFrame callback.
   */
  var storyElements;
  var story;
  var html;
  var recentupdate = false;


  function onStoryData (key, details) {

    // This seems odd. Surely we could just select the story
    // directly rather than looping through all of them.
          //console.log(details.id,key);
        key = "s-" + key;
        storyElements = document.getElementById(key);
        story = storyElements;
        html = storyTemplate(details);
        details.time *= 1000;
        // Tick down. When zero we can batch in the next load.
        updatehtml();
        updateStoryData(details);
        storyLoadCount--;

  }

  function updatehtml(){
    //requestAnimationFrame(updatehtml);
    storyElements.innerHTML = html;
  }

  function updateStoryData(details){
    //requestAnimationFrame(updateStoryData);
    storyElements.addEventListener('click', onStoryClick.bind(this, details));
    storyElements.classList.add('clickable');
  }


  function onStoryClick(details) {

    var storyDetails = $('sd-' + details.id);

    // Wait a little time then show the story details.
    requestAnimationFrame(showStory.bind(this, details.id));

    // Create and append the story. A visual change...
    // perhaps that should be in a requestAnimationFrame?
    // And maybe, since they're all the same, I don't
    // need to make a new element every single time? I mean,
    // it inflates the DOM and I can only see one at once.

    if (!storyDetails) {

      if (details.url)
        details.urlobj = new URL(details.url);

      var comment;
      var commentsElement;
      var storyHeader;
      var storyContent;

      var storyDetailsHtml = storyDetailsTemplate(details);
      var kids = details.kids;
      var commentHtml = storyDetailsCommentTemplate({
        by: '', text: 'Loading comment...'
      });

      storyDetails = document.createElement('section');
      storyDetails.setAttribute('id', 'sd-' + details.id);
      storyDetails.classList.add('story-details');
      storyDetails.innerHTML = storyDetailsHtml;
      //console.log(storyDetails);
      console.log("Test");
      document.body.appendChild(storyDetails);

      commentsElement = storyDetails.querySelector('.js-comments');
      storyHeader = storyDetails.querySelector('.js-header');

      var headerHeight = storyHeader.getBoundingClientRect().height;
      storyContent = storyDetails.querySelector('.js-content');

      var closeButton = storyDetails.querySelector('.js-close');
      closeButton.addEventListener('click', hideStory.bind(this, details.id));
      storyContent.style.paddingTop = headerHeight + 'px';

      if (typeof kids === 'undefined')
        return;

      for (var k = 0; k < kids.length; k++) {

        comment = document.createElement('aside');
        comment.setAttribute('id', 'sdc-' + kids[k]);
        comment.classList.add('story-details__comment');
        comment.innerHTML = commentHtml;
        commentsElement.appendChild(comment);

        // Update the comment with the live data.
        APP.Data.getStoryComment(kids[k], function(commentDetails) {

          commentDetails.time *= 1000;

          var comment = commentsElement.querySelector(
              '#sdc-' + commentDetails.id);
          comment.innerHTML = storyDetailsCommentTemplate(
              commentDetails,
              localeData);
        });
      }
    }

  }


  var storyDetailsPosition;

  function showStory(id) {

    if (inDetails)
      return;

    inDetails = true;

    storyDetails = $('#sd-' + id);
    storyDetailsPosition = storyDetails.getBoundingClientRect();

    var left = null;

    if (!storyDetails)
      return;

    //document.body.classList.add('details-active');
    storyDetails.style.opacity = 1;

    function animate () {

      // Find out where it currently is.
      //console.log("1",storyDetailsPosition);

      // Set the left value if we don't have one already.
      if (left === null)
        left = storyDetailsPosition.left;

      // Now figure out where it needs to go.
      left += (0 - storyDetailsPosition.left) * 0.1;

      // Set up the next bit of the animation if there is more to do.
      if (Math.abs(left) > 0.5)
          requestAnimationFrame(animate);
      else
        left = 0;

      // And update the styles. Wait, is this a read-write cycle?
      // I hope I don't trigger a forced synchronous layout!
      storyDetails.style.left = left + 'px';
    }

    // We want slick, right, so let's do a setTimeout
    // every few milliseconds. That's going to keep
    // it all tight. Or maybe we're doing visual changes
    // and they should be in a requestAnimationFrame
    requestAnimationFrame(animate);
    console.log("Test");
  }


  function hideStory(id) {

    if (!inDetails)
      return;

    var storyDetails = $('#sd-' + id);
    var left = 0;

    document.body.classList.remove('details-active');
    storyDetails.style.opacity = 0;

    function animate () {

      // Find out where it currently is.
      var mainPosition = main.getBoundingClientRect();
      var storyDetailsPosition = storyDetails.getBoundingClientRect();
      var target = mainPosition.width + 100;

      // Now figure out where it needs to go.
      left += (target - storyDetailsPosition.left) * 0.1;

      // Set up the next bit of the animation if there is more to do.
      if (Math.abs(left - target) > 0.5) {
        window.requestAnimationFrame(animate);
      } else {
        left = target;
        inDetails = false;
      }

      // And update the styles. Wait, is this a read-write cycle?
      // I hope I don't trigger a forced synchronous layout!
      storyDetails.style.left = left + 'px';
    }

    // We want slick, right, so let's do a setTimeout
    // every few milliseconds. That's going to keep
    // it all tight. Or maybe we're doing visual changes
    // and they should be in a requestAnimationFrame
    window.requestAnimationFrame(animate);
  }

  /**
   * Does this really add anything? Can we do this kind
   * of work in a cheaper way?
   */

function colorizeAndScaleStories() {

    var storyElements = document.querySelectorAll('.story');
    var height = main.offsetHeight;
    var mainPosition = main.getBoundingClientRect();
    var bodyPosition = document.body.getBoundingClientRect().top;
    var story_array = [];
    var score = [];
    var title = [];
    var scoreLocations_top = [];
    var scoreLocation_width = [];
    var saturation = [];
    var viewportelements = [];

    for (var s=0; s < storyElements.length; s++) {
    if (isElementInViewport(storyElements[s])) {
        viewportelements.push(storyElements[s]);
      }
    }

    for (var s=0; s < viewportelements.length; s++){
      story_array.push(viewportelements[s]);
      score.push(story_array[s].querySelector('.story__score'));
      title.push(story_array[s].querySelector('.story__title'));
      score_bounding_box = score[s].getBoundingClientRect();
      scoreLocations_top.push(score_bounding_box.top - bodyPosition);
      scoreLocation_width.push(score_bounding_box.width);
      saturation.push((100 * ((scoreLocation_width[s] - 38) / 2)));
    }

    for (var s = 0; s < viewportelements.length; s++) {

      var scale = Math.min(1, 1 - (0.05 * ((scoreLocations_top[s] - 170) / height)));
      var opacity = Math.min(1, 1 - (0.5 * ((scoreLocations_top[s] - 170) / height)));

      score[s].style.width = (scale * 40) + 'px';
      score[s].style.height = (scale * 40) + 'px';
      score[s].style.lineHeight = (scale * 40) + 'px';

      score[s].style.backgroundColor = 'hsl(42, ' + saturation[s] + '%, 50%)';
      title[s].style.opacity = opacity;
    }
  }


  var header = $('header');
  var headerTitles = header.querySelector('.header__title-wrapper');
  var mainscrollTop = 0;
  var mainscrollHeight = 0;
  var mainoffsetHeight = 0;
  var ticking = false;

  main.addEventListener('scroll', function() {
    mainscrollTop = main.scrollTop;
    mainscrollHeight = main.scrollHeight;
    mainoffsetHeight = main.offsetHeight;
    //;
    requestScroll();
    update();
  });

  function update() {
    if (storyLoadCount < 30)
      requestAnimationFrame(loadStoryBatch);
  }

  function updateheader() {
    header.style.height = (156 - Math.min(70, mainscrollTop)) + 'px';
    headerTitles.style.webkitTransform = 'scale(' + (1 - (scrollTopCapped / 300)) + ')';
    headerTitles.style.transform = 'scale(' + (1 - (scrollTopCapped / 300)) + ')';
  }

  function requestScroll() {
    //requestAnimationFrame(colorizeAndScaleStories);
    if (mainscrollTop < 500){
      requestAnimationFrame(updateheader);
    }
  }

  function loadStoryBatch() {
    storyLoadCount = count;
    var maxload = stories.length;
    var end = storyStart + count;
    for (var i = storyStart; i < end; i++) {
      if (i >= maxload){
        return;
      }
      var key = String(stories[i]);
      var story = document.createElement('div');
      story.setAttribute('id', 's-' + key);
      story.classList.add('story');
      main.appendChild(story);
      APP.Data.getStoryById(stories[i],onStoryData.bind(this, key));
    }
    storyStart += count;
  }

  function isElementInViewport (el) {
  var rect = el.getBoundingClientRect();
  return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
  }
  // Bootstrap in the stories.

  APP.Data.getTopStories(function(data) {
    stories = data;
    requestAnimationFrame(loadStoryBatch);
  });

})();
