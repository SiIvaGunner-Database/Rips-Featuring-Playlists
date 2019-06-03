var spreadsheetID = '1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M';//SiIvaJokes

//Updates playlist as the associated spreadsheet is updated
function playlistUpdate()
{
  var sheetName = getPlaylistInfo('names');//['Minecraft with Gadget', 'Nathaniel Welchert', 'Original Compositions', 'Sentence Mixing'];
  var playlistID = getPlaylistInfo('IDs');//['PLn8P5M1uNQk4e8Y-LVtnoZ4rjsHOF3gMj', 'PLn8P5M1uNQk68CN4cN3i0b8l1OByyoM_0', 'PLn8P5M1uNQk6cT0YV161eTznwpzc0sqss', 'PLn8P5M1uNQk7Uj5GmdBcuxOAzxfWUac-Z'];
  var successCount = 0;
  var failCount = 0;
  
  for (i in sheetName)
  {
    Logger.log("Working on " + sheetName[i] + " [" + playlistID[i] + "]");
    console.log("Working on " + sheetName[i] + " [" + playlistID[i] + "]");
    var list = readValues(spreadsheetID, sheetName[i]);
    var missingVideos = findMissingItems(playlistID[i], list)
    
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
        console.log(searchResult[1] + " failed to insert. Error: " + e);
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




//Finds the the highest cell row with content in the sheet
function readValues(spreadsheetID, sheetName)
{
  //sheetName = 'Rips with Sentence Mixing';
  Logger.log(sheetName);
  
  var removedSpreadsheet = SpreadsheetApp.openById('1pWzlHW2A7tgSbAsbfWgvjgAt3D_Gzr8I_nv7WxgJcuk');//SiIvaInfo
  var removedSheet = removedSpreadsheet.getSheetByName('Removed Rips');
  var removedData = removedSheet.getDataRange();
  var removedValues = removedData.getValues();
  var removedRow = 96;
  var removedList = [];
  var removedRips = [];
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetID);//SiIvaJokes
  var sheet = spreadsheet.getSheetByName(sheetName);
  var data = sheet.getDataRange();
  var values = data.getValues();
  var cellRow = 60;
  var list = [];

  var startRow = 60;
  var cont = true;
  
  while (cont)
  {
      if (values[startRow][0] == "Other")
      {
        cellRow = startRow;
        cont = false;
      }
    startRow++;
  }
  
  cont = true;
  
  while (cont)
  {
    try 
    {
      if (removedValues[removedRow][0] != "")
        removedList[removedRow - 96] = formatString(removedValues[removedRow][0]);
      else
        cont = false;
    } catch (e) {
      cont = false;
      console.log(e);
    }
    removedRow++;
  }
  
  cont = true;
  var notRemoved = true;
  
  while (cont)
  {
    try 
    {
      if (values[cellRow][0] != "")
      {
        notRemoved = true;
        /*
        for (i in removedList)
        {
          if (removedList[i].toLowerCase().equals(formatString(values[cellRow][0]).toLowerCase()))
          {
            try 
            {
              removedRips.push(removedList[i]);
            } catch (e)
            {
              Logger.log(e)
            }
            notRemoved = false;
          }
        }
        //*/
        if (notRemoved)
          list[cellRow - startRow - removedRips.length] = formatString(values[cellRow][0]);
      }
      else
        cont = false;
    } catch (e) {
      cont = false;
      console.log(e);
    }
    cellRow++;
  }
  
  if (removedRips != "")
    Logger.log("Removed rips: " + removedRips);

  return list;
}




//Determines whether the video is already in the playlist
function findMissingItems(playlistID, list) 
{
  /*
  playlistID = 'PLn8P5M1uNQk7Uj5GmdBcuxOAzxfWUac-Z';
  spreadsheetID = '1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M';
  sheetName = 'Rips with Sentence Mixing';
  list = readValues(spreadsheetID, sheetName);
  //*/
  
  var inPlaylist = [];
  var pageToken;
  
  do
  {
    var query = YouTube.PlaylistItems.list('snippet', {maxResults: 50, playlistId: playlistID, pageToken: pageToken});
    
    query.items.forEach(function(item) {inPlaylist.push(formatString(item.snippet.title))});
    
    pageToken = query.nextPageToken;
  } while (pageToken)
    
  Logger.log("Total videos: " + list.length);
  Logger.log("Videos in playlist: " + inPlaylist.length);
  console.log("Total videos: " + list.length);
  console.log("Videos in playlist: " + inPlaylist.length);
  
  var notInPlaylist = list;
  for (x in inPlaylist)
  {
    for (y in notInPlaylist)
    {
      if (notInPlaylist[y].toLowerCase().equals(inPlaylist[x].toLowerCase()))
        notInPlaylist.splice(y,1);
    }
  }
  Logger.log("Videos missing from playlist: " + notInPlaylist.length);
  console.log("Videos missing from playlist: " + notInPlaylist.length);
  return notInPlaylist;
}




//Searches for the video found in the sheet
function searchByKeyword(sheetTitle) 
{
  /*
  var list = readValues('1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M', 'Rips featuring Nathaniel Welchert');
  var missingVideos = findMissingItems('PLn8P5M1uNQk68CN4cN3i0b8l1OByyoM_0',list);
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
                                      maxResults: 2,
                                      type: 'video',
                                      channelId: channelID
                                    });
  
  results.items.forEach(function(item)
                        {
                          videoTitle = formatString(item.snippet.title);
                          Logger.log("Compare:\nVideo: " + videoTitle.toLowerCase() + "\nSheet: " + sheetTitle.toLowerCase());
                          console.log("Compare:\nVideo: " + videoTitle.toLowerCase() + "\nSheet: " + sheetTitle.toLowerCase());
                          
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
function getPlaylistInfo(type)
{
  //type = 'names';
  var spreadsheet = SpreadsheetApp.openById(spreadsheetID);//SiIvaJokes
  var sheets = spreadsheet.getSheets();
  var info = [];

  for (var i = 0; i < sheets.length; i++) {
    if (type == 'names')
      info.push(sheets[i].getName());
    else
      info.push(sheets[i].getRange('D1').getValue());
  }
  //Logger.log("Info: " + info);
  return info;
}




//
function formatString(str)
{
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#39;/g, '\'');
  str = str.replace(/&quo;/g, '\"');
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/(?:\r\n|\r|\n)/g, '');//Replaces line breaks
  str = str.replace(/☆/g, '');
  str = str.replace(/  /g, ' ');
  return str;
}
