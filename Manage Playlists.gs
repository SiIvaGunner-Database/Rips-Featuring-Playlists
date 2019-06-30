var siivaJokes = '1NJ6cDpib0VlORJfCiqTBcOswlu6uWRTzxeXgrzKnT_M';
var siivaInfo = "1pWzlHW2A7tgSbAsbfWgvjgAt3D_Gzr8I_nv7WxgJcuk";
var glNum;

// Creates news playlists as the associated wiki is updated.
function createPlaylist() 
{
  var vidID = '';
  var playlists = getMissingPlaylists();
  
  var myPlaylistsSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var myPlaylistsSheet = myPlaylistsSpreadsheet.getSheetByName("My Playlists");
  
  for (i = 1; i < 11; i++) 
  {
    //*
    try
    {
      var newPlaylist = YouTube.Playlists.insert(
        {
          snippet: {
            title: playlists[i],
            description: "SiIvaGunner " + playlists[i].replace('Rips', 'rips') +
            ". This playlist is automatically updated to reflect its respective category on the SiIvaGunner wiki. Some rips may be missing." +
            "\nhttps://siivagunner.fandom.com/wiki/Category:" + playlists[i].replace(/ /g, '_')
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
      
      myPlaylistsSheet.getRange(glNum + i, 1).setValue(playlists[i]);
      myPlaylistsSheet.getRange(glNum + i, 4).setValue(newPlaylist.id);
      
      if (i == 10)
        myPlaylistsSheet.getRange(glNum + i + 1, 1).setValue("Stop");

      updateSheet(newPlaylist.id, playlists[i], siivaJokes);
    } catch (e)
    {
      i = 11;
      Logger.log(e);
      console.log(e);
    }
    //*/
  }
  //sortGoogleSheets();
}




// Determines which playlists have not been created yet.
function getMissingPlaylists()
{
  var spreadsheet = SpreadsheetApp.openById(siivaInfo);
  var sheets = spreadsheet.getSheets();
  for (s in sheets)
    updateSheet("", sheets[s].getName(), siivaInfo);
  
  var sheet = spreadsheet.getSheetByName('Rips Featuring...');
  var data = sheet.getDataRange();
  var values = data.getValues();
  
  var cellRow = 79;
  var cont = true;
  var totalPlaylists = [];
  var existingPlaylists = getPlaylists();
  
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
  console.log("Total playlists: " + totalPlaylists.length);
  //console.log("Total playlists: " + totalPlaylists);
  
  var missingPlaylists = totalPlaylists;
  var row = 0;
  
  do
  {
    for (i in missingPlaylists)
    {
      if (existingPlaylists[1][row].toLowerCase().equals(missingPlaylists[i].toLowerCase()) || missingPlaylists[i].toLowerCase().equals("jojokes"))
      {
        missingPlaylists.splice(i,1);
      }
    }
    row++;
  } while (existingPlaylists[1][row]);
  
  Logger.log("Missing playlists: " + missingPlaylists.length);
  console.log("Missing playlists: " + missingPlaylists.length);
  console.log("Missing playlists: " + missingPlaylists);
  return missingPlaylists;
}




// Reads the list of playlists I've created from a spreadsheet.
function getPlaylists() 
{
  var myPlaylistsSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var myPlaylistsSheet = myPlaylistsSpreadsheet.getSheetByName("My Playlists");
  var myPlaylistsRange = myPlaylistsSheet.getDataRange();
  var myPlaylistsValues = myPlaylistsRange.getValues();
  var myPlaylists = [];
  var row = 1;
  
  var videoID;
  var videoTitle;
  var index = 1;
  var pageToken;
  var playlistID = [];
  var playlistTitle = [];
  
  //*
  var cont = true;
  
  while (cont)
  {
    if (myPlaylistsValues[row][0] != "Stop")
    {
      var title = myPlaylistsValues[row][0];
      var id = myPlaylistsValues[row][3];
      playlistID.push(id);
      playlistTitle.push(title);
      //updateSheet(id, title, siivaJokes);
      row++;
    } else
    {
      glNum = row;
      cont = false
    }
  }
  //*/
  
  /*
  do {
  var playlists = YouTube.Playlists.list('snippet', 
  {
  maxResults: 50,
  type: 'playlist',
  mine: true,
  pageToken: pageToken
  });
  
  playlists.items.forEach(function(item)
  {
  var desc = item.snippet.description.toLowerCase().toString();
  if (desc.indexOf('siivagunner') !== -1)
  {
  var title = item.snippet.title.toString();
  var id = item.id;
  
  var a = "A" + row;
  var b = "B" + row;
  Logger.log(a);
  
  myPlaylistsSheet.getRange(row, 1).setValue(title);
  myPlaylistsSheet.getRange(row, 4).setValue(id);
  
  row++;
  
  updateSheet(id, title, siivaJokes);
  playlistID.push(id);
  playlistTitle.push(title);
  }
  });
  pageToken = playlists.nextPageToken;
  } while (pageToken);
  //*/
  
  //Logger.log(playlistTitle);
  return [playlistID, playlistTitle];
}




// Adds ImportXML and playlist ID to a new sheet or updates ImportXML on an old sheet.
function updateSheet(playlistID, sheetName, sheetID)
{
  //playlistID = 'PLn8P5M1uNQk4e8Y-LVtnoZ4rjsHOF3gMj';
  //sheetName = 'Rips featuring Bad Apple!!';
  
  var formattedName = sheetName.replace(/ /g, '_');
  var spreadsheet = SpreadsheetApp.openById(sheetID);
  Logger.log(sheetName);
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (sheet == null)
  {
    sheet = spreadsheet.insertSheet();
    sheet.setName(sheetName);
    sheet.getRange('A1').setValue('=importxml("https://siivagunner.fandom.com/wiki/Category:' + formattedName + '", "//ul/li/a")');
    sheet.getRange('D1').setValue(playlistID);
    Logger.log("Created new sheet for " + sheetName + "    \n[" + playlistID + "]");
    console.log("Created new sheet for " + sheetName + "    \n[" + playlistID + "]");
  } else // Update the sheet's importxml function
  {
    try {
      // Credit to Mogsdad and Gerbus: https://stackoverflow.com/questions/33872967/periodically-refresh-importxml-spreadsheet-function/33875957
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(5000)) return;
      
      var re = /.*[^a-z0-9]import(?:xml|data|feed|html|range)\(.*/gi;
      var re2 = /((\?|&)(update=[0-9]*))/gi;
      var re3 = /(",)/gi;
      var dataRange = sheet.getDataRange();
      var formula = dataRange.getFormulas();
      var time = new Date().getTime();
      var content = formula[0][0];
      var match = content.search(re);
      
      var updatedContent = content.toString().replace(re2,"$2update=" + time);
      if (updatedContent == content) 
        updatedContent = content.toString().replace(re3,"?update=" + time + "$1");
      
      sheet.getRange('A1').setFormula(updatedContent);
      lock.releaseLock();
    } catch (e)
    {
      Logger.log(e);
    } finally // Credit to beano. https://stackoverflow.com/questions/53277135/there-are-too-many-lockservice-operations-against-the-same-script
    {
      //PropertiesService.getDocumentProperties().deleteProperty('lock');
    }
  }
}




// Updates all playlist descriptions.
function updatePlaylistDesc() 
{
  var pageToken;
  do 
  {
    var playlists = YouTube.Playlists.list('snippet', 
                                           {
                                             maxResults: 50,
                                             mine: true,
                                             pageToken: pageToken 
                                           });
    
    playlists.items.forEach(function(item)
                            {
                              var desc = item.snippet.description.toLowerCase().toString();
                              if (desc.indexOf('siivagunner') !== -1)
                                //if (item.snippet.description.indexOf('SiIvaGunner') !== -1)
                              {
                                var start = "SiIvaGunner "+ item.snippet.title.replace('Rips', 'rips') + ". ";
                                var extra = "";
                                var middle = "This playlist is automatically updated to reflect its respective category on the SiIvaGunner wiki. Some rips may be missing.";
                                var end = "\nhttps://siivagunner.fandom.com/wiki/Category:" + item.snippet.title.replace(/ /g, '_');
                                
                                switch(item.snippet.title) 
                                {
                                  case "Original Compositions from SiIvaGunner":
                                    start = "SiIvaGunner rips with original compositions. ";
                                    end = "\nhttps://siivagunner.fandom.com/wiki/Category:Original_compositions";
                                    break;
                                    
                                  case "SiIvaGunner JoJokes":
                                    start = "SiIvaGunner rips with JoJokes. ";
                                    end = "\nhttps://siivagunner.fandom.com/wiki/Category:JoJokes";
                                    break;
                                    
                                  case "Rips featuring Minecraft with Gadget":
                                    extra = "Does not include rips that only use Inspector Gadget's theme. ";
                                    break;
                                    
                                  case "Rips with Sentence Mixing":
                                    end = "\nhttps://siivagunner.fandom.com/wiki/Category:Rips_with_sentence_mixing";
                                    break;
                                }
                                var newDesc = start + extra + middle + end;
                                
                                if (newDesc != item.snippet.description)
                                {
                                  item.snippet.description = newDesc;
                                  
                                  var updateRes = YouTube.Playlists.update(item, "snippet");
                                  Logger.log("Updating " + item.snippet.title + ": " + newDesc);
                                }
                              }
                            });
    pageToken = playlists.nextPageToken;
  } while (pageToken);
}




// Spreadsheet sorting function credit to Amit Agarwal.
// https://ctrlq.org/code/20033-reorder-google-spreadsheet
function sortGoogleSheets() 
{
  var sheetNames = [siivaJokes, siivaInfo];
  for (name in sheetNames)
  {
    var spreadsheet = SpreadsheetApp.openById(sheetNames[name]);
    var sheets = spreadsheet.getSheets();
    
    // Store all the worksheets in this array
    var sheetNameArray = [];
    
    for (var i = 0; i < sheets.length; i++) 
    {
      sheetNameArray.push(sheets[i].getName());
    }
    
    sheetNameArray.sort();
    
    // Reorder the sheets.
    for( var j = 0; j < sheets.length; j++ )
    {
      spreadsheet.setActiveSheet(spreadsheet.getSheetByName(sheetNameArray[j]));
      spreadsheet.moveActiveSheet(j + 1);
    }
  }
}
