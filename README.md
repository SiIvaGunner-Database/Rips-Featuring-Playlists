# SiIvaGunner Rips Featuring Playlists

A Google Script project that creates and manages YouTube playlists from the corresponding category items retrieved from the SiIvaGunner wiki. Currently managing over 150 playlists.

These playlists are checked for updates on a daily basis. First, the script checks the list of currently existing playlists and compares it to the list of “Rips Featuring...” categories. If missing items are found, the script creates a new playlist for that category, gives it a corresponding title and description, and adds it to the list of existing playlists.

After checking for missing playlists, the script runs again to find missing videos and add them to the appropriate playlists. Going through the list of existing playlists one by one, the script compares the list of videos currently in each playlist to the items in the corresponding categories to find missing videos. It then searches YouTube for each video to add to the playlist if a matching title is found.

### External Links

* [Project Playlists](https://www.youtube.com/channel/UC6ajqR7lEYf-33Gsj4lgVOA/playlists?view=1)

* [Project Script](https://script.google.com/d/1e1SrxrNiv3TNQJYM4hDtM6Syhk9lwu9eZtn2cwJgz4fRo837YmaEagAS/edit?usp=sharing)

* [Project Spreadsheet](https://docs.google.com/spreadsheets/d/1poNOCj5M31QSkdD4AMXvewuFMj-YQ6UzmJvT3PdyxNo/edit?usp=sharing)

* [SiIvaGunner Wiki](https://siivagunner.fandom.com/wiki/SiIvaGunner_Wikia)
