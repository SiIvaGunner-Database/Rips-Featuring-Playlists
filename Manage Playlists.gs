// Creates news playlists when new categories have been added to the wiki.
function createPlaylists() 
{
  var playlists = getMissingPlaylists();
  var row = ripsFeaturing.getRange("I4").getValue() + 2;
  
  Logger.log("There are " + playlists.length + " missing playlists: " + playlists);
  
  for (var i = 0; i < playlists.length; i++)
  {
    // YouTube only allows ten playlists to be created per day.
    if (i > 10)
      break;
    
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
    
    ripsFeaturing.getRange(row, 1).setValue(playlists[i]);
    ripsFeaturing.getRange(row, 4).setValue(newPlaylist.id);
    
    Logger.log("Created " + playlists[i] + " [" + newPlaylist.id + "]");
    
    //*/
    row++;
  }
}




// Finds categories that do not have playlists.
function getMissingPlaylists()
{
  var existingPlaylists = getSheetInfo('names');
  var missingPlaylists = [];
  var missing = true;

  var url = "https://siivagunner.fandom.com/api.php?";
  
  var params = {
    action: "query",
    list: "categorymembers",
    cmtitle: "Category:Rips_featuring...",
    cmtpye: "title",
    cmlimit: "500",
    format: "json"
  };
  
  Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
  
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  var totalCategories = data.query.categorymembers;
  
  for (i in totalCategories)
  {
    for (j in existingPlaylists)
    {
      if (existingPlaylists[j] == totalCategories[i].title.replace("Category:", ""))
      {
        missing = false;
        break;
      }
    }
    
    if (missing)
      missingPlaylists.push(totalCategories[i].title.replace("Category:", ""));
    
    missing = true;
  }
  
  Logger.log("Total categories: " + totalCategories.length);
  Logger.log("Existing playlists: " + existingPlaylists.length);
  Logger.log("Missing playlists: " + missingPlaylists.length);

  return missingPlaylists;
}




// To do: add continuation and read playlist IDs from sheet.
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
                                  case "Rips featuring Original Compositions":
                                    start = "SiIvaGunner rips with original compositions. ";
                                    end = "\nhttps://siivagunner.fandom.com/wiki/Category:Original_compositions";
                                    break;
                                    
                                  case "Rips featuring JoJokes":
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
