// Functions for creating triggers to run the script automatically.

function createPlaylistTrigger()
{
  ScriptApp.newTrigger('createPlaylist')
  .timeBased()
  .onWeekDay(ScriptApp.WeekDay.SUNDAY)
  .atHour(0)
  .create();
}

function createPlaylistDailyTrigger()
{
  ScriptApp.newTrigger('createPlaylist')
  .timeBased()
  .everyDays(1)
  .atHour(0)
  .create();
}

function updateAllSheetsTrigger()
{
  ScriptApp.newTrigger('updateAllSheets')
  .timeBased()
  .onWeekDay(ScriptApp.WeekDay.SUNDAY)
  .atHour(1)
  .create();
}

function updateAllSheetsDailyTrigger()
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
  .onWeekDay(ScriptApp.WeekDay.SUNDAY)
  .atHour(2)
  .create();
}

function addVideosToPlaylistsDailyTrigger()
{
  ScriptApp.newTrigger('addVideosToPlaylists')
  .timeBased()
  .everyDays(1)
  .atHour(2)
  .create();
}