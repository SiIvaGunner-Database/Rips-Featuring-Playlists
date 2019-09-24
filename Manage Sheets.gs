// Reads the list of playlists I've created from a spreadsheet.
function getSheetInfo(type)
{
  var myPlaylistsSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var myPlaylistsSheet = myPlaylistsSpreadsheet.getSheetByName("My Playlists");
  var myPlaylistsRange = myPlaylistsSheet.getDataRange();
  var myPlaylistsValues = myPlaylistsRange.getValues();
  var myPlaylists = [];
  
  var temporaryArray = [];
  var lastUpdatedPlaylist = myPlaylistsValues[0][3];
  
  var info = [];
  var row = 1;
  var cont = true;
  
  //*  
  while (cont)
  {
    if (myPlaylistsValues[row][0].equals(lastUpdatedPlaylist))
      cont = false;
    else
      switch(type)
      {
        case 'sheetNames':
          temporaryArray.push(myPlaylistsValues[row][0]);
          break;
        case 'playlistIDs':
          temporaryArray.push(myPlaylistsValues[row][3]);
          break;
        case 'spreadsheetIDs':
          temporaryArray.push(myPlaylistsValues[row][6]);
          break;
      }
    row++;
  }
  
  if (myPlaylistsValues[row][0] == "Stop")
    row = 1;
  
  cont = true;
  
  while (cont)
  {
    if (myPlaylistsValues[row][0] != "Stop")
    {
      switch(type)
      {
        case 'sheetNames':
          info.push(myPlaylistsValues[row][0]);
          break;
        case 'playlistIDs':
          info.push(myPlaylistsValues[row][3]);
          break;
        case 'spreadsheetIDs':
          info.push(myPlaylistsValues[row][6]);
          break;
      }
      row++;
    } 
    else
    {
      glNum = row;
      cont = false
    }
  }
  //*/
  
  for (t in temporaryArray)
  {
    info.push(temporaryArray[t])
  }
  
  return info;
}




// Adds ImportXML and playlist ID to a new sheet or updates ImportXML on an old sheet.
function updateSheet(playlistID, sheetName, sheetID)
{
  var formattedName = sheetName.replace(/ /g, '_');
  var spreadsheet = SpreadsheetApp.openById(sheetID);
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (sheet == null)
  {
    sheet = spreadsheet.insertSheet();
    sheet.setName(sheetName);
    sheet.getRange('A1').setValue('=importxml("https://siivagunner.fandom.com/wiki/Category:' + formattedName + '", "//ul/li/a")');
    sheet.getRange('D1').setValue(playlistID); // Currently not in use. Delete?
    Logger.log("Created new sheet for " + sheetName + "    \n[" + playlistID + "]");
    console.log("Created new sheet for " + sheetName + "    \n[" + playlistID + "]");
  } 
  else // Update the sheet's importxml function
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
      Logger.log("Updated " + sheetName);
      console.log("Updated " + sheetName);
    } catch (e)
    {
      Logger.log(e);
    } finally // Credit to beano. https://stackoverflow.com/questions/53277135/there-are-too-many-lockservice-operations-against-the-same-script
    {
      //PropertiesService.getDocumentProperties().deleteProperty('lock');
    }
  }
}




// Updates every sheet's importXML() function
function updateAllSheets()
{
  Logger.log("Start!");
  console.log("Start!");

  var playlistIDs = getSheetInfo('playlistIDs');
  var sheetNames = getSheetInfo('sheetNames');
  var spreadsheetIDs = getSheetInfo('spreadsheetIDs');
  
  for (var i in playlistIDs)
    updateSheet(playlistIDs[i], sheetNames[i], spreadsheetIDs[i]);

  Logger.log("Finished!");
  console.log("Finished!");
}




// Currently not in use
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
