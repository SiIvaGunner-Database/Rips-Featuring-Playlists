// Adds new videos to playlists when the associated wiki categories have been updated.
function updateRipsFeaturing()
{
  var startTime = new Date();
  var ripsFeaturing = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var categoryNames = getCategoryMembers("Rips_featuring...");
  var lastRow = ripsFeaturing.getLastRow();
  var row = ripsFeaturing.getRange(1, 4).getValue();
  var errorLog = [];
  var insertLog = [];
  
  // Check for new categories.
  for (var i in categoryNames)
  {
    categoryNames[i] = categoryNames[i].replace("Category:", "");
    
    for (var k in sheetNames)
    {
      if (sheetNames[k] == categoryNames[i])
        break;
      else if (k == sheetNames.length - 1)
      {
        var desc = "SiIvaGunner " + categoryNames[i].replace("Rips", "rips") +
                   ". This playlist is automatically updated to reflect its respective category on the SiIvaGunner wiki. Some rips may be missing." +
                   "\nhttps://siivagunner.fandom.com/wiki/Category:" + categoryNames[i].replace(/ /g, "_");

        var newPlaylist = YouTube.Playlists.insert({snippet: {title: categoryNames[i], description: desc}, status: {privacyStatus: 'public'}}, 'snippet,status');
        var titleHl = '=HYPERLINK("https://siivagunner.fandom.com/wiki/Category:' + categoryNames[i].replace(/ /g, "_").replace(/"/g, '""') + '", "' + categoryNames[i].replace(/"/g, '""') + '")';
        var idHl = '=HYPERLINK("https://www.youtube.com/playlist?list=' + newPlaylist.id + '", "' + newPlaylist.id +'")';
        
        ripsFeaturing.insertRowAfter(lastRow);
        lastRow++;
        ripsFeaturing.getRange(lastRow, 1).setValue(titleHl);
        ripsFeaturing.getRange(lastRow, 2).setValue(idHl);
        
        Logger.log("Created " + categoryNames[i] + " [" + newPlaylist.id + "] on row " + lastRow);
      }
    }
  }
  
  ripsFeaturing.getRange(2, 1, lastRow - 1, 2).sort({column: 1});
  var sheetNames = ripsFeaturing.getRange(2, 1, lastRow - 1).getValues();
  var playlistIds = ripsFeaturing.getRange(2, 2, lastRow - 1).getValues();
  
  // Check for new videos to add to "Rips featuring" playlists.
  for (var n in sheetNames)
  {
    if (row > lastRow)
      row = 2;
    else
      row++;
    
    var index = row - 2;
    Logger.log("Working on " + sheetNames[index] + " [" + playlistIds[index] + "]");
    var categoryRips = getCategoryMembers(sheetNames[index]);
    Logger.log("Videos in category: " + categoryRips.length);
    var playlistRips = getPlaylistMembers(playlistIds[index]);
    Logger.log("Videos in playlist: " + playlistRips.length);
    
    for (var i in categoryRips)
    {
      var vidNum = parseInt(i) + 1;
      var videoId = getVideoId(categoryRips[i]);
      
      for (var k in playlistRips)
      {
        if (videoId == playlistRips[k])
          break;
        else if (videoId == "ignore")
        {
          Logger.log(categoryRips[i] + " [" + videoId + "] failed to get the correct ID for " + sheetNames[index] + "\n" + e);
          errorLog.push(categoryRips[i] + " [" + videoId + "] failed to get the correct ID for " + sheetNames[index] + "\n" + e);
          break;
        }
        else if (k == playlistRips.length - 1)
        {
          try
          {
            YouTube.PlaylistItems.insert({snippet: {playlistId: playlistIds[index][0], resourceId: {kind: "youtube#video", videoId: videoId}}}, "snippet");
            Logger.log(categoryRips[i] + " [" + videoId + "] inserted to " + sheetNames[index]);
            insertLog.push(categoryRips[i] + " [" + videoId + "] inserted to " + sheetNames[index]);
          }
          catch (e)
          {
            Logger.log(categoryRips[i] + " [" + videoId + "] failed to insert to " + sheetNames[index] + "\n" + e);
            errorLog.push(categoryRips[i] + " [" + videoId + "] failed to insert to " + sheetNames[index] + "\n" + e);
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
  
  
  
  
  // Get all titles from a category.
  function getCategoryMembers(sheetName)
  {
    var categoryRips = [];
    var e = "";
    var url = "https://siivagunner.fandom.com/api.php?"; 
    var params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:" + encodeURIComponent(sheetName.toString()),
      cmtpye: "title",
      cmlimit: "500",
      format: "json"
    };
    
    Object.keys(params).forEach(function(key) {url += "&" + key + "=" + params[key];});
    
    while (e.indexOf("404") == -1)
    {
      try
      {
        var response = UrlFetchApp.fetch(url);
        var data = JSON.parse(response.getContentText());
        var categoryRips = data.query.categorymembers;
        for (var i in categoryRips)
          categoryRips[i] = categoryRips[i].title;
        return categoryRips;
      }
      catch(e)
      {
        Logger.log(e);
        errorLog.push(e);
      }
    }
  }
  
  
  
  
  // Get all video ID's from a playlist.
  function getPlaylistMembers(playlistID) 
  {
    var playlistMembers = [];
    var nextPageToken = "";
    
    while (nextPageToken != null)
    {
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistID, maxResults: 50, pageToken: nextPageToken});
      playlistResponse.items.forEach(function(item) {playlistMembers.push(item.snippet.resourceId.videoId)});
      nextPageToken = playlistResponse.nextPageToken;
    }
    
    return playlistMembers;
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
      titles: encodeURIComponent(title.toString())
    };
    
    Object.keys(params).forEach(function(key) {url += "&" + key + "=" + params[key];});
    
    while (e.indexOf("404") == -1)
    {
      try
      {
        var response = UrlFetchApp.fetch(url);
        var data = response.getContentText().replace(/\|/g, "\n");
        
        if (data.indexOf("\nlink") != -1)
        {
          var idPattern = new RegExp("link(.*)\n");
          var id = idPattern.exec(data).toString().split(",").pop().replace("=", "").trim();
          
          if (id.length != 11)
            id = id.replace(/.*v=/g, "").replace(/.*be\//g, "").replace(/<.*/g, "");
          
          if (id.length == 11)
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
}
