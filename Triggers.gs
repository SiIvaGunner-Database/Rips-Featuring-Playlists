// Functions for creating triggers to run the script automatically.

function recreateTriggers()
{
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++)
    ScriptApp.deleteTrigger(allTriggers[i]);
  
  //createPlaylistsTrigger(); Don't use
  updateAllSheetsTrigger();
  addVideosToPlaylistsTrigger();
  recreateTriggersTrigger();
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
  .atHour(0)
  .create();
}

function updateAllSheetsTrigger()
{
  ScriptApp.newTrigger('updateAllSheets')
  .timeBased()
  .everyDays(1)
  .atHour(1)
  .create();
}

function addVideosToPlaylistsTrigger()
{
  ScriptApp.newTrigger('addVideosToPlaylists')
  .timeBased()
  .everyDays(1)
  .atHour(2)
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