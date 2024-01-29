// Get all video ID's from a playlist.
function getPlaylistMemberIds(playlistId) {
  var playlistMemberIds = [];
  var nextPageToken = "";

  while (nextPageToken != null) {
    var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, maxResults: 50, pageToken: nextPageToken});
    playlistResponse.items.forEach(function(item) {playlistMemberIds.push(item.snippet.resourceId.videoId)});
    nextPageToken = playlistResponse.nextPageToken;
  }

  var videoIds = [];

  // Check for and remove any duplicates.
  for (var index in playlistMemberIds) {
    var playlistMemberId = playlistMemberIds[index];

    if (videoIds.includes(playlistMemberId)) {
      Logger.log("Remove from playlist: " + playlistMemberId);
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: playlistMemberId});
      var deletionId = playlistResponse.items[0].id;
      YouTube.PlaylistItems.remove(deletionId);
    }
    else videoIds.push(playlistMemberId);
  }

  return videoIds;
}




// Get all titles from a category.
function getCategoryMemberTitles(sheetName) {
  var categoryTitles = [];
  var error = "";
  var cmcontinue = "";

  while (cmcontinue != null && !error.includes("404")) {
    var url = "https://siivagunner.fandom.com/api.php?"; 
    var params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:" + encodeURIComponent(sheetName),
      cmlimit: "500",
      cmcontinue: encodeURIComponent(cmcontinue),
      format: "json"
    };

    Object.keys(params).forEach(function(key) {url += "&" + key + "=" + params[key];});
    console.log(url);

    try {
      var response = UrlFetchApp.fetch(url);
      var data = JSON.parse(response.getContentText());
      var categoryMembers = data.query.categorymembers;
      cmcontinue = data.continue ? data.continue.cmcontinue : null;

      if (categoryMembers.length === 0) {
        var emailAddress = "a.k.zamboni@gmail.com";
        var subject = "No Category Members Found: " + sheetName;
        var message = "No category members found: " + sheetName + "\n\n" + url;

        console.warn(message);
        MailApp.sendEmail(emailAddress, subject, message);
      }

      for (var i in categoryMembers) {
        categoryTitles.push(categoryMembers[i].title);
      }
    }
    catch(error) {
      Logger.log(error.stack);
      errorLog.push(error);
    }
  }

  return categoryTitles;
}




// Get the video ID from a wiki article.
function getVideoId(title) {
  var error = "";
  var url = "https://siivagunner.fandom.com/api.php?"; 
  var params = {
    action: "query",
    prop: "revisions",
    rvprop: "content",
    titles: encodeURIComponent(title.toString()),
    format: "json"
  };

  Object.keys(params).forEach(function(key) {url += "&" + key + "=" + params[key];});

  while (!error.includes("404")) {
    try {
      var response = UrlFetchApp.fetch(url);
      var data = response.getContentText().replace(/\\n/g, "").replace(/\|/g, "\n");

      if (data.includes("\nlink")) {
        var idPattern = new RegExp("link(.*)\n");
        var id = idPattern.exec(data).toString().split(",").pop().replace("=", "").trim();

        if (id.length != 11)
          id = id.replace(/.*v=/g, "").replace(/.*be\//g, "").replace(/<.*/g, "").replace(/ .*/g, "");

        return id;
      }
      return "ignore";
    }
    catch(error) {
      Logger.log(error.stack);
    }
  }
}
