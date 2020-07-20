// To do: add continuation, read playlist IDs from sheet, add existing category check.
// Updates all playlist descriptions. This code is outdated and unused.
function updatePlaylistDescriptions() 
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
