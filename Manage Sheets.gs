// Reads the list of playlists I've created from the spreadsheet.
function getSheetInfo(type)
{
  var type = "sheetNames";
  var myPlaylists = [];
  var tempArr = [];
  var returnData = [];
  var index = 0;
  
  var lastUpdatedRow = ripsFeaturing.getRange("I3").getValue();
  var playlistCount = ripsFeaturing.getRange("I4").getValue();
  
  var dataRange = "A2:A" + (playlistCount + 1);
  
  if (type == "sheetNames")
    var data = ripsFeaturing.getRange(dataRange).getValues();
  else if (type == "playlistIds")
    var data = ripsFeaturing.getRange(dataRange.replace(/A/g, "D")).getValues();
  
  while (index < lastUpdatedRow - 1)
  {
    tempArr.push(data[index][0]);
    index++;
  }
  
  while (index < playlistCount)
  {
    returnData.push(data[index][0]);
    index++;
  }
  
  for (t in tempArr)
    returnData.push(tempArr[t]);
  
  Logger.log(returnData);
  Logger.log(returnData.length);
  
  return returnData;
}
