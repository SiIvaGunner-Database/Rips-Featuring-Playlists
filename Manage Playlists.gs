//Creates news playlists as the associated wiki is updated
function createPlaylists() 
{
  var vidID = '';
  var playlists = findMissingPlaylists();
  
  for (i = 1; i < 11; i++) 
  {
    //*
    try
    {
      var newPlaylist = YouTube.Playlists.insert(
        {
          snippet: {
            title: playlists[i],
            description: 'SiIvagunner ' + playlists[i] + '.\nhttps://siivagunner.fandom.com/wiki/Category:' + playlists[i].replace(/ /g, '_')
          },
          status: {
            privacyStatus: 'public'
          }
        },
        'snippet,status'
      );
      
      var details = {
        videoId: vidID,
        kind: 'youtube#video'
      }
      
      var part= 'snippet';
      var resource = {
        snippet: {
          playlistId: newPlaylist.id
        }
      };
      
      createSheet(newPlaylist.id, playlists[i]);
      //*/
      
      //Wait one second to avoid hitting the rate limit
      //Utilities.sleep(1000);
    } catch (e)
    {
      i = 11;
      Logger.log(e);
      console.log(e);
    }
  }
}




//
function createSheet(playlistID, sheetName)
{
  //playlistID = 'PLn8P5M1uNQk4e8Y-LVtnoZ4rjsHOF3gMj';
  //sheetName = 'Rips featuring Bird Up!';
  formattedName = sheetName.replace(/ /g, '_');
  var spreadsheet = SpreadsheetApp.openById('1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M');//SiIvaJokes
  var newSheet = spreadsheet.getSheetByName(sheetName);
  
  if (newSheet == null) {
    newSheet = spreadsheet.insertSheet();
    newSheet.setName(sheetName);
    newSheet.getRange('A1').setValue('=importxml("https://siivagunner.fandom.com/wiki/Category:' + formattedName + '", "//ul/li/a")');
    newSheet.getRange('D1').setValue(playlistID);
  }
}




//
function findMissingPlaylists()
{
  var spreadsheet = SpreadsheetApp.openById('1pWzlHW2A7tgSbAsbfWgvjgAt3D_Gzr8I_nv7WxgJcuk');//SiIvaInfo
  var sheet = spreadsheet.getSheetByName('Rips Featuring...');
  var data = sheet.getDataRange();
  var values = data.getValues();
  var cellRow = 79;
  var cont = true;
  var totalPlaylists = [];
  var existingPlaylists = myPlaylists();
  
  while (cont == true)
  {
    try 
    {
      if (values[cellRow][0] != "")
        totalPlaylists[cellRow - 79] = values[cellRow][0].replace('Category:', '');
      else
        cont = false;
      //Logger.log(totalPlaylists[cellRow - 79]);
    } catch (e) {
      cont = false;
      console.log(e);
      Logger.log(e);
    }
    cellRow++;
  }

  Logger.log("Total playlists: " + totalPlaylists.length);
  
  var missingPlaylists = totalPlaylists;

  var notInPlaylist = totalPlaylists;
  var row = 0;
  do
  {
    for (i in missingPlaylists)
    {
      if (existingPlaylists[1][row].toLowerCase().equals(missingPlaylists[i].toLowerCase()))
      {
        missingPlaylists.splice(i,1);
      }
    }
    row++;
  } while (existingPlaylists[1][row])
  
  Logger.log("Missing playlists: " + missingPlaylists.length);
  //Logger.log("All titles: [Original Compositions,Sentence Mixing," + totalPlaylists + "]");
  return missingPlaylists;
}




//
function myPlaylists(sheetTitle) 
{
  var videoID;
  var videoTitle;
  var index = 0;
  var pageToken;
  var playlistID = [];
  var playlistTitle = [];
  
  do {
    var playlists = YouTube.Playlists.list('snippet', 
                                           {
                                             maxResults: 2,
                                             type: 'playlist',
                                             mine: true,
                                             pageToken: pageToken
                                           });
    
    playlists.items.forEach(function(item)
                            {
                              var desc = item.snippet.description.toLowerCase().toString();
                              var title = item.snippet.title.toLowerCase().toString();
                              var id = item.id;
                              if (desc.indexOf('siivagunner') !== -1)
                              {
                                playlistID[index] = id;
                                playlistTitle[index] = title;
                                index++;
                              }
                            });
    pageToken = playlists.nextPageToken;
  } while (pageToken) 
    
  Logger.log(playlistTitle);
  return [playlistID, playlistTitle];
}
