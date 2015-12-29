onmessage = function(e) {


  importScripts('namespace.js','data.js');

  APP.Data.getTopStories(function(data) {
  	 stories = data;
  	 for (i = 0; i < 10 ; i++) {
  	 	console.log(stories[i]);
  	 	APP.Data.getStoryById(stories[i], function(data) {
     		var workresult =  data
     		console.log(stories[i]);
  	 });
  	 //postMessage(workresult);
  	}
  });

  /*stories = e.data
   APP.Data.getStoryById(stories, function(data) {
     var workresult =  data
     //postMessage(workresult);
  });*/

}
