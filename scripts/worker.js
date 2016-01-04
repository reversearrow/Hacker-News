/*
onmessage = function(e) {

  var HN_API_BASE = 'https://hacker-news.firebaseio.com';
  var HN_TOPSTORIES_URL = HN_API_BASE + '/v0/topstories.json';
  var HN_STORYDETAILS_URL = HN_API_BASE + '/v0/item/[ID].json';

  //callback_str = e.data.callback
  //callback = "function(evt) {" + callback_str + "(evt.target.response);}"
  console.log(e.data.callback);
  var callback = e.data.callback;
  getTopStories(callback)

  function getTopStories(callback) {

     request(HN_TOPSTORIES_URL, function(evt) {
      callback(evt.target.response);
    });
  }

 function request(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = callback;
    xhr.send();
  }
}
*/