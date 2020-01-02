// For testing string comparisons.
function test()
{
  str = "Your Best Nightmare (Beta Mix Alternative Unused OST Version) - Undertale";
  Logger.log(formatVideoTitle(formatForVideosInPlaylist(str)).toLowerCase());
  Logger.log(formatVideoTitle(str).toLowerCase());
  Logger.log(formatVideoTitle(formatForVideosInPlaylist(str)).toLowerCase().equals(formatVideoTitle(str).toLowerCase()));
}

// Formats FANDOM category links.
function formatLink(str)
{
  str = str.replace(/ /g, "_");
  str = str.replace(/#/g, "");
  str = encodeURIComponent(str);

  return str;
}

// Replaces special characters and censored words.
function formatVideoTitle(str)
{
  str = str.replace(/é/g, 'e');
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#39;/g, '\'');
  str = str.replace(/&quot;/g, '\"');
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/\~/g, '-');
  str = str.replace(/(?:\r\n|\r|\n)/g, ''); // Replaces line breaks
  str = str.replace(/☆/g, '');
  str = str.replace(/ /g, '');
  str = str.replace(/#/g, '');
  str = str.replace(/−/g, '-');
  str = str.replace(/_/g, '');
  str = str.replace(/ʖ/g, '');
  str = str.replace(/Ultimate/g, 'UItimate');
  str = str.replace(/N----/g, 'Nigga');
  str = str.replace(/[^\w\s]/gi, '');
  
  return str;
}

// Removes added text in FANDOM titles.
function formatForVideosInPlaylist(str)
{
  str = str.replace(/\/Bean/g, '');
  str = str.replace(/\/Grand Dad/g, '');
  str = str.replace(/\/Kasino/g, '');
  str = str.replace(/\/Kirby Planet Robobot/g, '');
  str = str.replace(/\/Kirby Super Star Ultra/g, '');
  str = str.replace(/\/Nozomi/g, '');
  str = str.replace(/\/Original/g, '');
  str = str.replace(/\/Rap do Ovo/g, '');
  str = str.replace(/\/Steve Harvey/g, '');
  str = str.replace(/\/Bean/g, '');
  str = str.replace(/\/Grand Dad/g, '');
  str = str.replace(/\/Kasino/g, '');
  str = str.replace(/\/Kirby Planet Robobot/g, '');
  str = str.replace(/\/Kirby Super Star Ultra/g, '');
  str = str.replace(/\/Nozomi/g, '');
  str = str.replace(/\/Original/g, '');
  str = str.replace(/\/Rap do Ovo/g, '');
  str = str.replace(/\/Steve Harvey/g, '');

  /*
  str = str.replace(/\/1/g, '');
  str = str.replace(/\/2/g, '');
  str = str.replace(/\/3/g, '');
  //*/

  str = str.replace(/\/February 2/g, '');
  str = str.replace(/\/February 3/g, '');

  str = str.replace(/ \(April 16, 2016\)\/1/g, '');
  str = str.replace(/ \(April 16, 2016\)\/2/g, '');
  str = str.replace(/ \(April 16, 2016\)\/3/g, '');
  str = str.replace(/ \(April 16, 2016\)\/4/g, '');
  str = str.replace(/ \(April 16, 2016\)\/5/g, '');
  
  str = str.replace(/ \(May 30, 2016\)/g, '');
  str = str.replace(/ \(July 4, 2016\)/g, '');
  str = str.replace(/ \(February 2, 2017\)/g, '');
  str = str.replace(/ \(February 3, 2017\)/g, '');
  str = str.replace(/ \(April 11th, 2018\)/g, '');

  return str;
}
