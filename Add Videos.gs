var ripsFeaturing = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
var removedRips = getRemovedRips();

// Adds new videos to playlists as their associated joke category spreadsheets are updated.
function addVideosToPlaylists()
{
  startTime = new Date();

  var sheetNames = getSheetInfo('sheetNames');
  var playlistIDs = getSheetInfo('playlistIDs');
    
  var successCount = 0;
  var failCount = 0;
  
  for (i in sheetNames)
  {
    Logger.log("Working on " + sheetNames[i] + " [" + playlistIDs[i] + "]");
    console.log("Working on " + sheetNames[i] + " [" + playlistIDs[i] + "]");

    var missingVideos = getMissingRips(sheetNames[i], playlistIDs[i])
    
    for (video in missingVideos)
    {
      var vidNum = parseInt(video) + 1;
      Logger.log("Missing video #" + vidNum + ": " + missingVideos[video]);
      console.log("Missing video #" + vidNum + ": " + missingVideos[video]);
      /*
      var searchResult = searchForVideo(missingVideos[video]);
      
      if (searchResult[1] != null)
      {
        try
        {
          YouTube.PlaylistItems.insert
          ({
            snippet: 
            {
              playlistId: playlistIDs[i], 
              resourceId: 
              {
                kind: "youtube#video",
                videoId: searchResult[0]
              }
            }
          }, "snippet");
          
          Logger.log("Video added to " + sheetNames[i])
          console.log("Video added to " + sheetNames[i])
          successCount++;
        } catch (e)
        {
          Logger.log("Video failed to insert.");
          console.log("Video failed to insert.");
          failCount++;
        }
      } 
      else
      {
        Logger.log("[" + searchResult[0] + ", " + searchResult[1] + "] Video not found.");
        console.log("[" + searchResult[0] + ", " + searchResult[1] + "] Video not found.");
        failCount++;
      }
      //*/
    }
    // Update the value for lastUpdatedPlaylist
    ripsFeaturing.getRange('I2').setValue(sheetNames[i]);
    ripsFeaturing.getRange('I3').setValue(i + 2);

    // Check if the script timer has passed 5 minutes
    var currentTime = new Date();
    if (currentTime.getTime() - startTime.getTime() > 300000)
      break;
  }
  
  Logger.log("Videos added to playlists: " + successCount);
  Logger.log("Videos causing errors: " + failCount);
  console.log("Videos added to playlists: " + successCount);
  console.log("Videos causing errors: " + failCount);

  scheduleTrigger();
  
  Logger.log("The script will resume in ten minutes.");
  console.log("The script will resume in ten minutes.");
}




// Reads the values of all rips that are in any removed categories on the wiki.
function getRemovedRips()
{
  var removedListNames = ['9/11_2016', 'GiIvaSunner_non-reuploaded', 'Removed_Green_de_la_Bean_rips', 'Removed_rips', 'Unlisted_rips', 'Unlisted_videos'];
  var removedList = [];
  
  for (var i in removedListNames)
  {
    var url = "https://siivagunner.fandom.com/api.php?"; 
    
    var params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:" + removedListNames[i],
      cmtpye: "title",
      cmlimit: "5000",
      format: "json"
    };
    
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
    
    var response = UrlFetchApp.fetch(url);
    var data = JSON.parse(response.getContentText());
    var rips = data.query.categorymembers;
    
    for (j in rips)
      removedList.push(rips[j].title);
  }
  return removedList;
}




// Reads the values from a sheet containing rips from a joke category.
function getCategoryRips(sheetName)
{
  //sheetName = "Rips featuring GO MY WAY!!";
  var url = "https://siivagunner.fandom.com/api.php?"; 
  
  var removedCategoryRips = [];
  var categoryRips = [];

  var removed = false;
  var shift = false;
  
  var params = {
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:" + formatLink(sheetName),
    cmtpye: "title",
    cmlimit: "5000",
    format: "json"
  };
  
  Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
  
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  var rips = data.query.categorymembers;
  
  for (i in rips)
  {
    for (j in removedRips)
    {
      if (removedRips[j] == rips[i].title)
      {
        removedCategoryRips.push(rips[i].title);
        removed = true;
        break;
      }
    }
    
    if (!removed && rips[i].title.indexOf("Category:" === -1))
      categoryRips.push(rips[i].title);
    
    removed = false;
  }

  if (removedCategoryRips != "")
  {
    Logger.log("Removed rips: " + removedCategoryRips.length);
    Logger.log("Removed rips: " + removedCategoryRips);
    Logger.log("Category rips: " + categoryRips.length);
    Logger.log("Category rips: " + categoryRips);
    console.log("Removed rips: " + removedCategoryRips.length);
    console.log("Removed rips: " + removedCategoryRips);
  }
  
  return categoryRips;
}




// Determines what rips are missing from the playlist.
function getMissingRips(sheetName, playlistID) 
{
  var list = getCategoryRips(sheetName);
  var inPlaylist = [];
  var pageToken;
  
  do
  {
    var query = YouTube.PlaylistItems.list('snippet', {maxResults: 50, playlistId: playlistID, pageToken: pageToken});
    
    query.items.forEach(function(item) {inPlaylist.push(item.snippet.title)});
    
    pageToken = query.nextPageToken;
  } while (pageToken)
    
  Logger.log("Total videos: " + list.length);
  console.log("Total videos: " + list.length);
  
  var notInPlaylist = list;
  for (x in inPlaylist)
  {
    for (y in notInPlaylist)
    {
      if (formatVideoTitle(formatForVideosInPlaylist(notInPlaylist[y])).toLowerCase().equals(formatVideoTitle(inPlaylist[x]).toLowerCase()))
        notInPlaylist.splice(y,1);
    }
  }
  
  Logger.log("Videos in playlist: " + inPlaylist.length);
  console.log("Videos in playlist: " + inPlaylist.length);
  
  Logger.log("Videos missing from playlist: " + notInPlaylist.length);
  console.log("Videos missing from playlist: " + notInPlaylist.length);
  return notInPlaylist;
}




// Searches YouTube for the specified video.
function searchForVideo(wikiTitle) 
{
  var videoID;
  var videoTitle;
  var channelID = 'UC9ecwl3FTG66jIKA9JRDtmg'; //SiIvaGunner
  var count = 0;
  
  var results = YouTube.Search.list('id,snippet',
                                    {
                                      q: wikiTitle,
                                      maxResults: 5,
                                      type: 'video',
                                      channelId: channelID
                                    });
  
  results.items.forEach(function(item)
                        {
                          videoTitle = item.snippet.title;
                          Logger.log("Compare:\nVideo: " + formatVideoTitle(videoTitle).toLowerCase() + "\nWiki: " + formatVideoTitle(wikiTitle).toLowerCase());
                          console.log("Compare:\nVideo: " + formatVideoTitle(videoTitle).toLowerCase() + "    \nWiki: " + formatVideoTitle(wikiTitle).toLowerCase());
                          
                          if (formatVideoTitle(videoTitle).toLowerCase().equals(formatVideoTitle(wikiTitle).toLowerCase()))//missingVideos[i])
                          {
                            videoID = item.id.videoId;
                            count++;
                          }
                        });
  
  return [videoID, videoTitle];
}
