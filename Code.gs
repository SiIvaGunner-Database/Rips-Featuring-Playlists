/**
 * Create and update "Rips featuring..." playlists to match the wiki categories, then send an email summarizing the results of the run.
 * See also, the "Rips Featuring" sheet: https://docs.google.com/spreadsheets/d/1poNOCj5M31QSkdD4AMXvewuFMj-YQ6UzmJvT3PdyxNo
 */
function updateRipsFeaturingPlaylists() {
  const startTime = new Date()
  const sheet = SpreadsheetApp.openById("1poNOCj5M31QSkdD4AMXvewuFMj-YQ6UzmJvT3PdyxNo").getActiveSheet()
  const newPlaylists = createPlaylists(sheet)
  const [addedVideos, removedVideos] = updatePlaylists(sheet, startTime)
  sendEmailSummary(newPlaylists, addedVideos, removedVideos)
}

/**
 * Check the base "Rips featuring..." category to find and create playlists that haven't been created yet.
 * @param {Sheet} sheet - The "Rips Featuring" sheet.
 * @return {Array[String]} An array of newly created playlist IDs, if any.
 */
function createPlaylists(sheet) {
  const categoryTitles = getCategoryTitles("Rips featuring...")
  const playlistTitles = sheet.getRange("A2:A").getValues().map(values => values[0])
  const newPlaylists = []

  console.log("Categories:", categoryTitles.length)
  console.log("Playlists:", playlistTitles.length)

  // Loop through all of the categories to check for ones that don't have playlists yet
  for (const categoryFullTitle of categoryTitles) {
    const categoryShortTitle = categoryFullTitle.replace("Category:", "")

    // If this category already has a playlist, continue to the next category
    if (playlistTitles.includes(categoryShortTitle) === true) {
      continue
    }

    console.log("New playlist: ", categoryShortTitle)
    const categoryUrl = `https://siivagunner.fandom.com/wiki/${categoryFullTitle}`
    const description = `
      SiIvaGunner ${categoryShortTitle.replace("Rips", "rips")}. This playlist is automatically updated to reflect its respective category on the SiIvaGunner wiki. Some rips may be missing.\n${categoryUrl}
    `
    const snippet = {
      "title": categoryShortTitle,
      "description": description
    }
    const newPlaylist = HighQualityUtils.youtube().createPlaylist(snippet)
    // TODO - Fix the title hyperlink. It's currently missing "Category:" from the URL.
    const titleHyperlink = HighQualityUtils.utils().formatFandomHyperlink(categoryShortTitle, "siivagunner")
    const idHyperlink = HighQualityUtils.utils().formatYoutubeHyperlink(newPlaylist.id)

    const lastRow = sheet.getLastRow()
    sheet.insertRowAfter(lastRow)
    sheet.getRange(lastRow + 1, 1).setValue(titleHyperlink)
    sheet.getRange(lastRow + 1, 2).setValue(idHyperlink)

    newPlaylists.push(`https://www.youtube.com/playlist?list=${newPlaylist.id}`)
  }

  sheet.getRange("A2:C").sort({ column: 1 })
  return newPlaylists
}

/**
 * Add and remove videos in existing "Rips featuring..." playlists to match the associated wiki categories as closely as possible.
 * @param {Sheet} sheet - The "Rips Featuring" sheet.
 * @param {Date} startTime - The date the script started at.
 * @return {Array[Array[String], Array[String]]} An array containing two arrays: one for added video IDs and another for removed video IDs.
 */
function updatePlaylists(sheet, startTime) {
  const properties = PropertiesService.getScriptProperties()
  const addedVideos = []
  const removedVideos = []

  // Get the sheet values and reorganize the array to start from the current row
  let rangeValues = sheet.getRange("A2:B").getValues()
  let currentRow = Number(properties.getProperty("currentRow") | 2)
  const currentIndex = currentRow - 2
  rangeValues = rangeValues.slice(currentIndex, rangeValues.length).concat(rangeValues.slice(0, currentIndex))

  // Loop through each playlist to check for new videos to add and old videos to remove
  for (const [playlistTitle, playlistId] of rangeValues) {
    console.log(`Working on ${playlistTitle} [${playlistId}]`)
    const categoryVideoTitles = getCategoryTitles(playlistTitle)

    // If no category members are found, assume the category has been deleted and continue to the next playlist
    if (categoryVideoTitles.length === 0) {
      console.log(`${playlistTitle} has been deleted`)
      sheet.getRange(currentRow, 3).setValue("This category has been deleted")
      const updatedTitle = `${playlistTitle} (outdated)`
      const updatedDescription = `
        SiIvaGunner ${playlistTitle.replace("Rips", "rips")}. This category has been deleted and is no longer updated.
      `
      const snippet = { 
        "title": updatedTitle,
        "description": updatedDescription
      }
      HighQualityUtils.youtube().updatePlaylist(playlistId, snippet)
      continue
    }

    const playlistVideoIds = HighQualityUtils.youtube().getPlaylistVideoIds(playlistId)
    const categoryVideoIds = []

    console.log("Category videos: ", categoryVideoTitles.length)
    console.log("Playlist videos: ", playlistVideoIds.length)

    // Loop through rip articles listed in the category to find ones that are missing from the playlist
    for (const categoryVideoTitle of categoryVideoTitles) {
      // If this item isn't another category page, then assume it is a regular rip article
      if (categoryVideoTitle.includes("Category:") === false) {
        let categoryVideoId

        // Try to fetch the video ID from the rip article page and continue to the next rip article if it fails
        try {
          categoryVideoId = HighQualityUtils.utils().fetchFandomVideoId("siivagunner", categoryVideoTitle)
          categoryVideoIds.push(categoryVideoId)
        } catch (error) {
          console.error("Error fetching video ID: ", categoryVideoTitle, "\n", error.stack)
          continue
        }

        // If this rip article isn't in the playlist, then try to add it to the playlist
        if (!playlistVideoIds.includes(categoryVideoId)) {
          try {
            HighQualityUtils.youtube().addToPlaylist(playlistId, categoryVideoId)
            console.log(`${categoryVideoTitle} [${categoryVideoId}] added to ${playlistTitle}`)
            addedVideos.push(categoryVideoId)
          } catch (error) {
            console.warn(`${categoryVideoTitle} [${categoryVideoId}] failed to add to ${playlistTitle}\n`, error.stack)

            if (error.message.includes("quota")) {
              console.warn("The YouTube API quota has been exceeded")
              return [addedVideos, removedVideos]
            }
          }
        }
      }

      // If the script timer has passed 5 minutes and 50 seconds, end the playlist updates
      if (new Date().getTime() - startTime.getTime() > 350000) {
        return [addedVideos, removedVideos]
      }
    }

    // Loop through videos listed in the playlist to find ones that are not in the category
    for (const playlistVideoId of playlistVideoIds) {
      // If this video wasn't found in the category, then try to remove it from the playlist
      if (categoryVideoIds.includes(playlistVideoId) === false) {
        try {
          HighQualityUtils.youtube().removeFromPlaylist(playlistId, playlistVideoId)
          console.log(`Video [${playlistVideoId}] removed from ${playlistTitle}`)
          removedVideos.push(playlistVideoId)
        } catch (error) {
          console.warn(`Video [${playlistVideoId}] failed to remove from ${playlistTitle}\n`, error.stack)

          if (error.message.includes("quota")) {
            console.warn("The YouTube API quota has been exceeded")
            return [addedVideos, removedVideos]
          }
        }
      }

      // If the script timer has passed 5 minutes and 50 seconds, end the playlist updates
      if (new Date().getTime() - startTime.getTime() > 350000) {
        return [addedVideos, removedVideos]
      }
    }

    currentRow = (currentRow >= sheet.getLastRow() ? 2 : currentRow + 1)
    properties.setProperty("currentRow", currentRow)
  }

  return [addedVideos, removedVideos]
}

/**
 * Send an email summarizing any new playlists that were created as well as how many videos were added and removed from playlists.
 * @param {Array[String]} newPlaylists - An array of playlist IDs.
 * @param {Array[String]} addedVideos - An array of video IDs.
 * @param {Array[String]} removedVideos - An array of video IDs.
 */
function sendEmailSummary(newPlaylists, addedVideos, removedVideos) {
  const emailAddress = "a.k.zamboni@gmail.com"
  const subject = `Rips Featuring Playlists Summary ${new Date()}`
  const newPlaylistsString = newPlaylists.length > 0 ? `\n - ${newPlaylists.join("\n - ")}` : "n/a"
  const message = `
    New playlists: ${newPlaylistsString}
    Videos added to playlists: ${addedVideos.length}
    Videos removed from playlists: ${removedVideos.length}
  `
  console.log(message)
  MailApp.sendEmail(emailAddress, subject, message)
}

/**
 * Get all page titles listed in a wiki category.
 * @param {String} categoryTitle - The title of the wiki category, omitting the "Category:" keyword.
 * @return {Array[String]} The page titles.
 */
function getCategoryTitles(categoryTitle) {
  return HighQualityUtils.utils()
    .fetchFandomCategoryMembers("siivagunner", categoryTitle)
    .map(categoryMember => categoryMember.title)
}
