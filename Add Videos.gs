var siivaInfo = '1pWzlHW2A7tgSbAsbfWgvjgAt3D_Gzr8I_nv7WxgJcuk';
var removedList = getRemovedRips();

// Adds new videos to playlists as their associated joke category spreadsheets are updated.
function addVideosToPlaylists()
{
  startTime = new Date();
  Logger.log("Start!");
  console.log("Start!");
  
  var sheetNames = getSheetInfo('sheetNames');
  var playlistIDs = getSheetInfo('playlistIDs');
  var spreadsheetIDs = getSheetInfo('spreadsheetIDs');
  
  var myPlaylistsSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var myPlaylistsSheet = myPlaylistsSpreadsheet.getSheetByName('My Playlists');
    
  var successCount = 0;
  var failCount = 0;
  
  for (i in sheetNames)
  {
    Logger.log("Working on " + sheetNames[i] + " [" + playlistIDs[i] + "] [" + spreadsheetIDs[i] + "]");
    console.log("Working on " + sheetNames[i] + " [" + playlistIDs[i] + "] [" + spreadsheetIDs[i] + "]");

    var missingVideos = getMissingRips(sheetNames[i], playlistIDs[i], spreadsheetIDs[i])
    
    for (video in missingVideos)
    {
      var vidNum = parseInt(video) + 1;
      Logger.log("Missing video #" + vidNum + ": " + missingVideos[video]);
      console.log("Missing video #" + vidNum + ": " + missingVideos[video]);
      //*
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
    myPlaylistsSheet.getRange('D1').setValue(sheetNames[i]);

    // Check if the script timer has passed 5 minutes
    var currentTime = new Date();
    if (currentTime.getTime() - startTime.getTime() > 300000)
      break;
  }
  Logger.log("Videos added to playlists: " + successCount);
  Logger.log("Videos causing errors: " + failCount);
  console.log("Videos added: " + successCount);
  console.log("Videos failed: " + failCount);

  scheduleTrigger();
  Logger.log("The script will resume in ten minutes.");
  console.log("The script will resume in ten minutes.");
}




// Reads the values of all rips that are in any removed categories on the wiki.
function getRemovedRips()
{
  var removedSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var removedListNames = ['9/11 2016', 'GiIvaSunner non-reuploaded', 'Removed Green de la Bean rips', 'Removed Rips', 'Unlisted Rips', 'Unlisted videos'];
  var removedList = [];
  
  var startRow = 60;
  var cont = true;
  
  for (name in removedListNames)
  {
    var removedSheet = removedSpreadsheet.getSheetByName(removedListNames[name]);
    var removedData = removedSheet.getDataRange();
    var removedValues = removedData.getValues();
    var removedRow = 60;
    var countVals = 0;
    while (cont)
    {
      startRow++;
      if (removedValues[startRow][0] == "Other")
      {
        removedRow = startRow+1;
        cont = false;
      }
    }
    
    cont = true;
    
    while (cont)
    {
      try 
      {
        if (removedValues[removedRow][0] != "")
        {
          removedList.push(removedValues[removedRow][0]);
        }
        else
          cont = false;
      } catch (e) 
      {
        cont = false;
        console.log(e);
      }
      removedRow++;
    }
    
    startRow = 60;
    cont = true;
  }

  return removedList;
}




// Reads the values from a sheet containing rips from a joke category.
function getCategoryRips(sheetName, spreadsheetID)
{
  var spreadsheet = SpreadsheetApp.openById(spreadsheetID);
  var sheet = spreadsheet.getSheetByName(sheetName);
  var data = sheet.getDataRange();
  var values = data.getValues();
  
  var cellRow = 60;
  var list = [];
  var removedRips = [];
  
  var startRow = 60;
  var cont = true;
  
  while (cont)
  {
    startRow++;
    if (values[startRow][0] == "Other")
    {
      cellRow = startRow+1;
      cont = false;
    }
  }
  
  cont = true;
  
  while (cont)
  {
    try 
    {
      if (values[cellRow][0] != "")
      {
        found = false;
        for (r in removedList)
        {
          if (formatVideoTitle(removedList[r]).toLowerCase().equals(formatVideoTitle(values[cellRow][0]).toLowerCase()))
          {
            if (!found)
              removedRips.push(removedList[r]);
            found = true;
          }
        }
        if (!found && formatVideoTitle(values[cellRow][0]).toLowerCase().indexOf('category') === -1)
        list.push(values[cellRow][0]);
      }
      else
      {
        cont = false;
      }
    } catch (e) {
      cont = false;
      console.log(e);
    }
    cellRow++;
  }
  
  if (removedRips != "")
  {
    Logger.log("Removed rips: " + removedRips.length);
    Logger.log("Removed rips: " + removedRips);
    console.log("Removed rips: " + removedRips.length);
    console.log("Removed rips: " + removedRips);
  }
  
  return list;
}




// Determines what rips are missing from the playlist.
function getMissingRips(sheetName, playlistID, spreadsheetID) 
{
  var list = getCategoryRips(sheetName, spreadsheetID);
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
function searchForVideo(sheetTitle) 
{
  var videoID;
  var videoTitle;
  var channelID = 'UC9ecwl3FTG66jIKA9JRDtmg'; //SiIvaGunner
  var count = 0;
  
  var results = YouTube.Search.list('id,snippet', 
                                    {
                                      q: sheetTitle,//missingVideos[i],
                                      maxResults: 5,
                                      type: 'video',
                                      channelId: channelID
                                    });
  
  results.items.forEach(function(item)
                        {
                          videoTitle = item.snippet.title;
                          Logger.log("Compare:\nVideo: " + formatVideoTitle(videoTitle).toLowerCase() + "\nSheet: " + formatVideoTitle(sheetTitle).toLowerCase());
                          console.log("Compare:\nVideo: " + formatVideoTitle(videoTitle).toLowerCase() + "    \nSheet: " + formatVideoTitle(sheetTitle).toLowerCase());
                          
                          if (formatVideoTitle(videoTitle).toLowerCase().equals(formatVideoTitle(sheetTitle).toLowerCase()))//missingVideos[i])
                          {
                            videoID = item.id.videoId;
                            count++;
                          }
                        });
  
  return [videoID, videoTitle];
}





// Replaces special characters and censored words.
function formatVideoTitle(str)
{
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#39;/g, '\'');
  str = str.replace(/&quot;/g, '\"');
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/\~/g, '-');
  str = str.replace(/(?:\r\n|\r|\n)/g, '');//Replaces line breaks
  str = str.replace(/☆/g, '');
  str = str.replace(/ /g, '');
  str = str.replace(/#/g, '');
  str = str.replace(/−/g, '-');
  str = str.replace(/_/g, '');
  str = str.replace(/ʖ/g, '');
  str = str.replace(/Ultimate/g, 'UItimate');
  str = str.replace(/N----/g, 'Nigga');
  str = str.replace(/[^\w\s]/gi, '');
  
  return str;
}

function formatForVideosInPlaylist(str)
{
  str = str.replace(/\/Bean/g, '');
  str = str.replace(/\/Grand Dad/g, '');
  str = str.replace(/\/Kasino/g, '');
  str = str.replace(/\/Kirby Planet Robobot/g, '');
  str = str.replace(/\/Kirby Super Star Ultra/g, '');
  str = str.replace(/\/Nozomi/g, '');
  str = str.replace(/\/Original/g, '');
  str = str.replace(/\/Rap do Ovo/g, '');
  str = str.replace(/\/Steve Harvey/g, '');
  str = str.replace(/\/Bean/g, '');
  str = str.replace(/\/Grand Dad/g, '');
  str = str.replace(/\/Kasino/g, '');
  str = str.replace(/\/Kirby Planet Robobot/g, '');
  str = str.replace(/\/Kirby Super Star Ultra/g, '');
  str = str.replace(/\/Nozomi/g, '');
  str = str.replace(/\/Original/g, '');
  str = str.replace(/\/Rap do Ovo/g, '');
  str = str.replace(/\/Steve Harvey/g, '');

  str = str.replace(/\/1/g, '');
  str = str.replace(/\/2/g, '');
  str = str.replace(/\/3/g, '');

  str = str.replace(/\/February 2/g, '');
  str = str.replace(/\/February 3/g, '');

  str = str.replace(/ \(April 16, 2016\)\/1/g, '');
  str = str.replace(/ \(April 16, 2016\)\/2/g, '');
  str = str.replace(/ \(April 16, 2016\)\/3/g, '');
  str = str.replace(/ \(April 16, 2016\)\/4/g, '');
  str = str.replace(/ \(April 16, 2016\)\/5/g, '');
  
  str = str.replace(/ \(May 30, 2016\)/g, '');
  str = str.replace(/ \(July 4, 2016\)/g, '');
  str = str.replace(/ \(February 2, 2017\)/g, '');
  str = str.replace(/ \(February 3, 2017\)/g, '');
  
  return str;
}
