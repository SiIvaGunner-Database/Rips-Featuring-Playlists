// Functions for creating triggers to run the script automatically.
// Deletes and recreates all triggers. For use when scheduled times are changed.
function recreateTriggers()
{
  var triggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < triggers.length; i++)
    ScriptApp.deleteTrigger(triggers[i]);
  
  createPlaylistsTrigger();
  addVideosToPlaylistsTrigger();

  Logger.log("All triggers have been successfully deleted and recreated.");
}

function createPlaylistsTrigger()
{
  ScriptApp.newTrigger('createPlaylists')
  .timeBased()
  .everyDays(1)
  .atHour(22)
  .create();
}


function addVideosToPlaylistsTrigger()
{
  ScriptApp.newTrigger('addVideosToPlaylists')
  .timeBased()
  .everyDays(1)
  .atHour(23)
  .create();
}
