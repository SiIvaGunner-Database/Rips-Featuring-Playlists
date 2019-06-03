function playlistUpdateTrigger()
{
  ScriptApp.newTrigger('playlistUpdate')
  .timeBased()
  .onWeekDay(ScriptApp.WeekDay.SUNDAY)
  .atHour(1)
  .create();
}

function playlistUpdateDailyTrigger()
{
  ScriptApp.newTrigger('playlistUpdate')
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