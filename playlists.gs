// Adds new videos to playlists when the associated wiki categories have been updated.
function updateRipsFeaturing()
{
  var startTime = new Date();
  var ripsFeaturing = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var categoryNames = getCategoryMemberTitles("Rips_featuring...");
  var lastRow = ripsFeaturing.getLastRow();
  var sheetNames = ripsFeaturing.getRange(2, 1, lastRow - 1).getValues();
  var row = ripsFeaturing.getRange(1, 4).getValue();
  var errorLog = [];
  var insertLog = [];

  for (var index in sheetNames)
  {
    sheetNames[index] = sheetNames[index][0];
  }
  
  Logger.log("Categories:\t" + categoryNames.length);
  Logger.log("Playlists:\t" + sheetNames.length);

  // Check for new categories.
  for (var categoryIndex in categoryNames)
  {
    var categoryName = categoryNames[categoryIndex].replace("Category:", "");
    
    if (!sheetNames.includes(categoryName))
    {
      var desc = "SiIvaGunner " + categoryName.replace("Rips", "rips") +
                  ". This playlist is automatically updated to reflect its respective category on the SiIvaGunner wiki. Some rips may be missing." +
                  "\nhttps://siivagunner.fandom.com/wiki/Category:" + categoryName.replace(/ /g, "_");

      var newPlaylist = YouTube.Playlists.insert({snippet: {title: categoryName, description: desc}, status: {privacyStatus: 'public'}}, 'snippet,status');
      var titleHl = '=HYPERLINK("https://siivagunner.fandom.com/wiki/Category:' + categoryName.replace(/ /g, "_").replace(/"/g, '""') + '", "' + categoryName.replace(/"/g, '""') + '")';
      var idHl = '=HYPERLINK("https://www.youtube.com/playlist?list=' + newPlaylist.id + '", "' + newPlaylist.id +'")';
      
      ripsFeaturing.insertRowAfter(lastRow);
      lastRow++;
      ripsFeaturing.getRange(lastRow, 1).setValue(titleHl);
      ripsFeaturing.getRange(lastRow, 2).setValue(idHl);
      
      var emailAddress = "a.k.zamboni@gmail.com";
      var subject = "New Rips Featuring Playlist";
      var message = "Created " + categoryName + " [" + newPlaylist.id + "]";
      
      Logger.log(message);
      
      MailApp.sendEmail(emailAddress, subject, message);
    }
  }
  
  ripsFeaturing.getRange(2, 1, lastRow - 1, 2).sort({column: 1});
  var sheetNames = ripsFeaturing.getRange(2, 1, lastRow - 1).getValues();
  var playlistIds = ripsFeaturing.getRange(2, 2, lastRow - 1).getValues();
  
  // Check for new videos to add to "Rips featuring" playlists.
  // Loop through each category.
  for (var sheetIndex in sheetNames)
  {
    if (row >= lastRow)
      row = 2;
    else
      row++;
    
    var index = row - 2;
    var sheetName = sheetNames[index];
    var playlistId = playlistIds[index];
    Logger.log("Working on " + sheetName + " [" + playlistId + "]");
    var categoryRips = getCategoryMemberTitles(sheetName);
    Logger.log("Videos in category: " + categoryRips.length);
    var playlistRips = getPlaylistMemberIds(playlistId);
    Logger.log("Videos in playlist: " + playlistRips.length);
    
    // Loop through each category member title.
    for (var categoryIndex in categoryRips)
    {
      var categoryRip = categoryRips[categoryIndex];

      if (categoryRip.indexOf("Category:") == -1)
      {
        var videoId = getVideoId(categoryRip);

        if (!playlistRips.includes(videoId))
        {
          if (videoId == "ignore" || videoId.length != 11)
          {
            Logger.log(categoryRip + " [" + videoId + "] failed to get the correct ID for " + sheetName);
            errorLog.push(categoryRip + " [" + videoId + "] failed to get the correct ID for " + sheetName);
            break;
          }
          else
          {
            try
            {
              YouTube.PlaylistItems.insert({snippet: {playlistId: playlistIds[index][0], resourceId: {kind: "youtube#video", videoId: videoId}}}, "snippet");
              Logger.log(categoryRip + " [" + videoId + "] inserted to " + sheetName);
              insertLog.push(categoryRip + " [" + videoId + "] inserted to " + sheetName);
            }
            catch (e)
            {
              Logger.log(categoryRip + " [" + videoId + "] failed to insert to " + sheetName + "\n" + e);
              errorLog.push(categoryRip + " [" + videoId + "] failed to insert to " + sheetName + "\n" + e);
            }
          }
        }
      }
    }
    
    ripsFeaturing.getRange(1, 4).setValue(row);
    
    // Check if the script timer has passed 5 minutes.
    var currentTime = new Date();
    if (currentTime.getTime() - startTime.getTime() > 300000) break;
  }
  
  Logger.log("Videos added to playlists: " + insertLog.length);
  Logger.log("Videos causing errors: " + errorLog.length);
}




// Get all video ID's from a playlist.
function getPlaylistMemberIds(playlistId) 
{
  var playlistMemberIds = [];
  var nextPageToken = "";
  
  while (nextPageToken != null)
  {
    var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, maxResults: 50, pageToken: nextPageToken});
    playlistResponse.items.forEach(function(item) {playlistMemberIds.push(item.snippet.resourceId.videoId)});
    nextPageToken = playlistResponse.nextPageToken;
  }
  
  var videoIds = [];

  // Check for and remove any duplicates.
  for (var index in playlistMemberIds)
  {
    var playlistMemberId = playlistMemberIds[index];

    if (videoIds.includes(playlistMemberId))
    {
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
function getCategoryMemberTitles(sheetName)
{
  var categoryTitles = [];
  var error = "";
  var cmcontinue = "";

  while (cmcontinue != null && error.indexOf("404") == -1)
  {
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

    try
    {
      var response = UrlFetchApp.fetch(url);
      var data = JSON.parse(response.getContentText());
      var categoryMembers = data.query.categorymembers;
      cmcontinue = data.continue ? data.continue.cmcontinue : null;

      for (var i in categoryMembers)
        categoryTitles.push(categoryMembers[i].title);
    }
    catch(error)
    {
      Logger.log(error);
      errorLog.push(error);
    }
  }

  return categoryTitles;
}




// Get the video ID from a wiki article.
function getVideoId(title)
{
  var e = "";
  var url = "https://siivagunner.fandom.com/api.php?"; 
  var params = {
    action: "query",
    prop: "revisions",
    rvprop: "content",
    titles: encodeURIComponent(title.toString()),
    format: "json"
  };
  
  Object.keys(params).forEach(function(key) {url += "&" + key + "=" + params[key];});
  
  while (e.indexOf("404") == -1)
  {
    try
    {
      var response = UrlFetchApp.fetch(url);
      var data = response.getContentText().replace(/\\n/g, "").replace(/\|/g, "\n");
      
      if (data.indexOf("\nlink") != -1)
      {
        var idPattern = new RegExp("link(.*)\n");
        var id = idPattern.exec(data).toString().split(",").pop().replace("=", "").trim();
        
        if (id.length != 11)
          id = id.replace(/.*v=/g, "").replace(/.*be\//g, "").replace(/<.*/g, "").replace(/ .*/g, "");
        
        return id;
      }
      return "ignore";
    }
    catch(e)
    {
      Logger.log(e);
    }
  }
}
