// Functions for creating triggers to run the script automatically.

function addVideosToPlaylistsTrigger()
{
  ScriptApp.newTrigger('addVideosToPlaylists')
  .timeBased()
  .onWeekDay(ScriptApp.WeekDay.SUNDAY)
  .atHour(1)
  .create();
}

function addVideosToPlaylistsDailyTrigger()
{
  ScriptApp.newTrigger('addVideosToPlaylists')
  .timeBased()
  .everyDays(1)
  .atHour(0)
  .create();
}

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
