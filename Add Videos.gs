var siivaJokes = '1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M';
var siivaInfo = '1pWzlHW2A7tgSbAsbfWgvjgAt3D_Gzr8I_nv7WxgJcuk';
var removedList = getRemovedRips();

//Updates playlist as the associated spreadsheet is updated
function playlistUpdate1()
{
  var sheetName = getPlaylistInfo(siivaJokes, 'names');
  var playlistID = getPlaylistInfo(siivaJokes, 'IDs');
  var successCount = 0;
  var failCount = 0;
  
  for (i in sheetName)
  {
    Logger.log("Working on " + sheetName[i] + " [" + playlistID[i] + "]");
    console.log("Working on " + sheetName[i] + " [" + playlistID[i] + "]");
    var missingVideos = getMissingRips(playlistID[i], sheetName[i])
    
    for (video in missingVideos)
    {
      var vidNum = parseInt(video) + 1;
      Logger.log("Missing video #" + vidNum + ": " + missingVideos[video]);
      console.log("Missing video #" + vidNum + ": " + missingVideos[video]);
      //*
      var searchResult = searchByKeyword(missingVideos[video]);
      try
      {
        YouTube.PlaylistItems.insert
        ({
          snippet: 
          {
            playlistId: playlistID[i], 
            resourceId: 
            {
              kind: "youtube#video",
              videoId: searchResult[0]
            }
          }
        }, "snippet");
        
        successCount++;
        Logger.log("Video added to " + sheetName[i])
        console.log("Video added to " + sheetName[i])
      } catch (e)
      {
        Logger.log("Video failed to insert.");
        console.log("Video failed to insert.");
        failCount++;
      }
      //*/
    }
  }
  Logger.log("Videos added to playlists: " + successCount);
  Logger.log("Videos causing errors: " + failCount);
  console.log("Videos added: " + successCount);
  console.log("Videos failed: " + failCount);
}




function getRemovedRips()
{
  var removedSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var removedListNames = getPlaylistInfo(siivaInfo, 'names');
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
          removedList.push(formatString(removedValues[removedRow][0]));
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
  for (d in removedList)
  {
    //Logger.log("Formatted: " + formatString(removedList[d]));
  }
  
  return removedList
}




//Finds the the highest cell row with content in the sheet
function getValues(sheetName)
{
  /*
  sheetName = 'Rips featuring 7 GRAND DAD';
  //*/
  var spreadsheet = SpreadsheetApp.openById(siivaJokes);
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
          if (removedList[r].toLowerCase().equals(formatString(values[cellRow][0]).toLowerCase()))
          {
            if (!found)
              removedRips.push(removedList[r]);
            found = true;
          }
        }
        if (!found && formatString(values[cellRow][0]).toLowerCase().indexOf('category') === -1)
          list.push(formatString(values[cellRow][0]));
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




//Determines whether the video is already in the playlist
function getMissingRips(playlistID, sheetName) 
{
  /*
  playlistID = 'PLn8P5M1uNQk7Uj5GmdBcuxOAzxfWUac-Z';
  siivaJokes = '1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M';
  sheetName = 'Rips with Sentence Mixing';
  list = getValues(siivaJokes, sheetName);
  //*/
  
  var list = getValues(sheetName);
  var inPlaylist = [];
  var pageToken;
  
  do
  {
    var query = YouTube.PlaylistItems.list('snippet', {maxResults: 50, playlistId: playlistID, pageToken: pageToken});
    
    query.items.forEach(function(item) {inPlaylist.push(formatString(item.snippet.title))});
    
    pageToken = query.nextPageToken;
  } while (pageToken)
    
  Logger.log("Total videos: " + list.length);
  console.log("Total videos: " + list.length);

  var notInPlaylist = list;
  for (x in inPlaylist)
  {
    for (y in notInPlaylist)
    {
      if (notInPlaylist[y].toLowerCase().equals(inPlaylist[x].toLowerCase()))
        notInPlaylist.splice(y,1);
    }
  }
  
  Logger.log("Videos in playlist: " + inPlaylist.length);
  console.log("Videos in playlist: " + inPlaylist.length);

  Logger.log("Videos missing from playlist: " + notInPlaylist.length);
  console.log("Videos missing from playlist: " + notInPlaylist.length);
  return notInPlaylist;
}




//Searches for the video found in the sheet
function searchByKeyword(sheetTitle) 
{
  /*
  var list = getValues('1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M', 'Rips featuring Nathaniel Welchert');
  var missingVideos = getMissingRips('PLn8P5M1uNQk68CN4cN3i0b8l1OByyoM_0',list);
  //*/
  
  var videoID;
  var videoTitle;
  var channelID = 'UC9ecwl3FTG66jIKA9JRDtmg'; //SiIvaGunner
  var count = 0;
  
  //for (i in missingVideos) 
  //{
  var results = YouTube.Search.list('id,snippet', 
                                    {
                                      q: sheetTitle,//missingVideos[i],
                                      maxResults: 5,
                                      type: 'video',
                                      channelId: channelID
                                    });
  
  results.items.forEach(function(item)
                        {
                          videoTitle = formatString(item.snippet.title);
                          Logger.log("Compare:\nVideo: " + videoTitle.toLowerCase() + "\nSheet: " + sheetTitle.toLowerCase());
                          //console.log("Compare:\nVideo: " + videoTitle.toLowerCase() + "    \nSheet: " + sheetTitle.toLowerCase());
                          
                          if (videoTitle.toLowerCase().equals(sheetTitle.toLowerCase()))//missingVideos[i])
                          {
                            videoID = item.id.videoId;
                            count++;
                          }
                        });
  //}
  
  //Logger.log(count + " out of " + missingVideos.length + " matches found.");
  return [videoID, videoTitle];
}




//
function getPlaylistInfo(sheetID, type)
{
  //type = 'names';
  var spreadsheet = SpreadsheetApp.openById(sheetID);//SiIvaJokes
  var sheets = spreadsheet.getSheets();
  var info = [];

  for (var i = 0; i < sheets.length; i++) {
    if (!sheets[i].getName().equals('My Playlists') && !sheets[i].getName().equals('Rips Featuring...'))
    {
      if (type == 'names')
        info.push(sheets[i].getName());
      else
        info.push(sheets[i].getRange('D1').getValue());
    }
  }
  return info;
}




//
function formatString(str)
{
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#39;/g, '\'');
  str = str.replace(/&quot;/g, '\"');
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/\~/g, '-');
  str = str.replace(/(?:\r\n|\r|\n)/g, '');//Replaces line breaks
  str = str.replace(/☆/g, '');
  str = str.replace(/  /g, ' ');
  str = str.replace(/#/g, '');
  str = str.replace(/−/g, '-');
  str = str.replace(/Ultimate/g, 'UItimate');
  str = str.replace(/N----/g, 'Nigga');
  str = str.replace(/[^\w\s]/gi, '');
  
  return str;
}
