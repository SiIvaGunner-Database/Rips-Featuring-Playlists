// Functions for creating triggers to run the script automatically.

function recreateTriggers()
{
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++)
    ScriptApp.deleteTrigger(allTriggers[i]);
  
  //createPlaylistsTrigger(); Don't use yet
  addVideosToPlaylistsTrigger();
  recreateTriggersTrigger();

  Logger.log("All triggers have been successfully deleted and recreated.");
  console.log("All triggers have been successfully deleted and recreated.");
}

function scheduleTrigger()
{
  ScriptApp.newTrigger('addVideosToPlaylists')
  .timeBased()
  .after(10 * 60 * 1000) // 10 minutes
  .create();
}

function createPlaylistsTrigger()
{
  ScriptApp.newTrigger('createPlaylists')
  .timeBased()
  .everyDays(1)
  .atHour(21)
  .create();
}


function addVideosToPlaylistsTrigger()
{
  ScriptApp.newTrigger('addVideosToPlaylists')
  .timeBased()
  .everyDays(1)
  .atHour(22)
  .create();
}

// Triggerception
function recreateTriggersTrigger()
{
  ScriptApp.newTrigger('recreateTriggers')
  .timeBased()
  .everyDays(1)
  .atHour(23)
  .create();
}