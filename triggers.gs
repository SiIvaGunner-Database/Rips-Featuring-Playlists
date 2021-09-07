// Functions for creating triggers to run the script automatically.
// Deletes and recreates all triggers. For use when scheduled times are changed.
function recreateTriggers()
{
  var triggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < triggers.length; i++)
    ScriptApp.deleteTrigger(triggers[i]);
  
  updateRipsFeaturingTrigger();

  Logger.log("All triggers have been successfully deleted and recreated.");
}

function updateRipsFeaturingTrigger()
{
  ScriptApp.newTrigger('updateRipsFeaturing')
    .timeBased()
    .everyDays(1)
    .atHour(23)
    .create();
}
