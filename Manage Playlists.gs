siivaInfo = "1pWzlHW2A7tgSbAsbfWgvjgAt3D_Gzr8I_nv7WxgJcuk";
var glNum;

// Creates news playlists as the associated wiki is updated.
function createPlaylists() 
{
  var vidID = '';
  var playlists = getMissingPlaylists();
  
  var myPlaylistsSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var myPlaylistsSheet = myPlaylistsSpreadsheet.getSheetByName("My Playlists");
  Logger.log("Missing playlists: " + playlists);
  
  for (i = 1; i < playlists.length && i < 11; i++) 
  {
    Logger.log(i);
    /* // Don't run! Fix how it adds the playlist info to sheets!
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
    //myPlaylistsSheet.getRange(glNum + i, 7).setValue(sheetID);
    
    updateSheet(newPlaylist.id, playlists[i], '1EDckGQIN-E1JMQfdGvCOUiwgwRSlUb6JUEYAr3JW_cM');
    //*/
  }
  myPlaylistsSheet.getRange(glNum + i, 1).setValue("Stop");
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
  var existingPlaylists = getSheetInfo('sheetNames');
  Logger.log("Existing playlists: " + existingPlaylists.length);
  
  while (cont)
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
    for (var i in missingPlaylists)
    {
      if (existingPlaylists[row].equals(missingPlaylists[i].replace(/Rips with/g, "Rips featuring")) || missingPlaylists[i].equals("Other") || missingPlaylists[i].equals("JoJokes"))
        missingPlaylists.splice(i,1);
    }
    row++;
  } while (existingPlaylists[row]);
  
  Logger.log("Missing playlists: " + missingPlaylists.length);
  console.log("Missing playlists: " + missingPlaylists.length);
  return missingPlaylists;
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
