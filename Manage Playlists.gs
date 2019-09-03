siivaInfo = "1pWzlHW2A7tgSbAsbfWgvjgAt3D_Gzr8I_nv7WxgJcuk";
var glNum; // Make this work!

// Creates news playlists as the associated wiki is updated.
function createPlaylists() 
{
  var vidID = '';
  var sheetID = '';
  var playlists = getMissingPlaylists();
  
  var myPlaylistsSpreadsheet = SpreadsheetApp.openById(siivaInfo);
  var myPlaylistsSheet = myPlaylistsSpreadsheet.getSheetByName("My Playlists");
  
  Logger.log("Missing playlists: " + playlists);
  
  for (i in playlists)
  {
    if (i != 0 && i < 11)
    {
      //*
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
      
      var part = 'snippet';
      var resource = {
        snippet: {
          playlistId: newPlaylist.id
        }
      };
      
      sheetID = getSheetID(playlists[i]);
      
      Logger.log("glNum: " + glNum);
      console.log("glNum: " + glNum);
      
      myPlaylistsSheet.getRange(glNum + i, 1).setValue(playlists[i]);
      myPlaylistsSheet.getRange(glNum + i, 4).setValue(newPlaylist.id);
      myPlaylistsSheet.getRange(glNum + i, 7).setValue(sheetID);
      
      updateSheet(newPlaylist.id, playlists[i], sheetID);
      //*/
    }
  }
  myPlaylistsSheet.getRange(glNum + i, 1).setValue("Stop");
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
    } 
    catch (e) 
    {
      cont = false;
      console.log(e);
      Logger.log(e);
    }
    cellRow++;
  }
  
  Logger.log("Total playlists: " + totalPlaylists.length);
  console.log("Total playlists: " + totalPlaylists.length);
  
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




// Finds the correct sheet based on the first letter of the title
function getSheetID(sheetTitle)
{
  var sheetTitle = '';
  var firstChar = sheetTitle.replace(/Rips featuring /g, '').replace(/Rips with /g, '').toLowerCase().charAt(0);
  switch (firstChar)
  {
    case 'a':
      sheetID = '1DswELVej-7KQ_LBla-cgeBgXgQKf3jUnyBNmLLM1zk8';
      break;
    case 'b':
      sheetID = '1h92ZepKk8GCZSeK9W66BJap1A81QiUdoT4SxKhp4v94';
      break;
    case 'c':
      sheetID = '1Cwgz1lxPGs52XVubN9eygsykhdeOAiYNxuFnaheTdmM';
      break;
    case 'd':
      sheetID = '1EDckGQIN-E1JMQfdGvCOUiwgwRSlUb6JUEYAr3JW_cM';
      break;
    case 'e':
      sheetID = '1RGbGYlW0lG1SvZf-tJUZE6bgeQ87s85xfChk741kaWE';
      break;
    case 'f':
      sheetID = '1ijFLZZWjYZwwt_9X9R1GodpwEZgpI3F5Ey9FXBKt-vA';
      break;
    case 'g':
      sheetID = '1PrYGKBJlAQ8VPkwNX2Bh9DtI_5Hopb2chIrKErT2gJg';
      break;
    case 'h':
      sheetID = '1Fnm2Ph5bMr2FuAm2hzGUD2NAajRg0xBzW5nYw4tt8I8';
      break;
    case 'i':
      sheetID = '1RDJf6nEC4Gajnmc7m434fcUhLpG6nVQbGnp-1vUfbFs';
      break;
    case 'j':
      sheetID = '1munnkhj3rXAe4K3Di7qB8OJL7huPymjcVGvgl8eTh38';
      break;
    case 'k':
      sheetID = '19FA4p9zeU5PnrHjZwz32cb8IHbLn6s7xRLkD4crBKWQ';
      break;
    case 'l':
      sheetID = '1FZZWDOvc3yMSbIpwCHTVF1xAtYxA5g_KnoHMiPOz2nE';
      break;
    case 'm':
      sheetID = '1mYYm6jZ9_omMuHj9a-i_fcqtWT3BKBD06vXHxdXnYIo';
      break;
    case 'n':
      sheetID = '1uRuYWgxt0QSlDLSWRMxdGjlAk18aqH2vhzAju4JlVGI';
      break;
    case 'o':
      sheetID = '1Dy_xC5EsrkXVLkNEDtegB-nOnGVjpF2SOAb1Ya4XvR0';
      break;
    case 'p':
      sheetID = '1_KcAzS0QjN-x7l34IDkawpwaV-MZX3_CY7wJNTJe3KM';
      break;
    case 'q':
      sheetID = '15_K-_YcFcEm815VORB1mMAln6S7azLJLV7E89G07-2I';
      break;
    case 'r':
      sheetID = '1Ir-MDfyr2gJklDax22c-6rhSZVRvsHt0hzaVyn8Zki0';
      break;
    case 's':
      sheetID = '1XHBYGbFAyTYK_OmxkehI2e-2EU7aUrw_1ShDgN1Fue8';
      break;
    case 't':
      sheetID = '1A20ZSYilDKCCcFUh8P64-v3EqdLUnubEsIMwtC4DvA0';
      break;
    case 'u':
      sheetID = '1ek35quvJ4ACCotKXe1I0CPrJXOllBE3CPsBIf7oJXVg';
      break;
    case 'v':
      sheetID = '1M97XaDApZYeFjftK5rp53FguxEiMIPIQbQq6mBr-raI';
      break;
    case 'w':
      sheetID = '1UCDfQquElU279K34sFIR5D-Z7Z1nHXqKom_0VpA1VGA';
      break;
    case 'x':
      sheetID = '1EZkob8IjvCRHTYA-aJCwxyT1t0FstZXsNxA_9CrJ0AU';
      break;
    case 'y':
      sheetID = '1_ReM-lil3Slep_YFqLoM1aZ_OpmreAnsFKbE50gKWgk';
      break;
    case 'z':
      sheetID = '18f5JS1y7wbunJIOS5BSU3AP4JjY1bhBEwWAB44PDuOI';
      break;
    default:
      sheetID = '1IKPXrvvU6T4OrReLW_A6xaBVPx0BBbCJxwF-5aKpMv0';
  }
  Logger.log(firstChar);
  Logger.log(sheetID);
  return sheetID;
}