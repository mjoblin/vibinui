# vibinui

`vibinui` is a browser-based UI for [StreamMagic] audio streamers. `vibinui` also requires
installation of the `vibin` backend.

Vibin was developed for one person's specific music streaming needs (mine). It should however work
for anyone with a StreamMagic streamer, but has only been tested with the following:

* Cambridge Audio CXNv2 streamer.
* Local media stored on a NAS running [Asset UPnP].
* AirPlay running on a Mac.

Vibin is not intended to be a complete replacement for the official StreamMagic apps. Vibin lacks
features such as browsing internet radio, and has no support for TIDAL or Qobuz.

![Vibin]

## Installation

See the [Vibin backend documentation] for information on how to install both the backend and this
UI.

## Developers

See the [Developers README] for more information.

## Features

Watch the [overview video] (4m:15s) to see Vibin's features in action.

Vibin supports:

* **Currently-playing information**
  * Lyrics
  * Waveform
  * Links to external sites
* **Playlists**
  * View the active playlist
  * Modify the active playlist
  * Save and switch between playlists
* **Browse local media**
  * Artists, Albums, Tracks
  * Search by title, date, genre, etc.
  * Search for lyrics
  * Find the currently-playing track
* **Presets** (like internet radio)
* **Favorites**

### Currently-playing information

#### Lyrics

![Current track lyrics]

#### Lyrics from AirPlay source

![Current track airplay]

#### Waveform

![Current track waveform]

### Playlists

#### Detailed view

![Playlist detailed view]

#### Summary view

![Playlist summary view]

#### Playlist entry actions

![Playlist entry actions]

#### Playlist management

![Playlist manager]

### Browse local media

#### View all albums

![Albums]

#### View albums as a tiny wall

![Albums tiny wall]

#### Filter tracks by title

![Tracks filtered by title]

#### Filter tracks by lyrics

![Tracks filtered by lyrics]

### Presets

![Presets]

### Favorites

![Favorites]

### General features

#### Media filtering

![Media filtering]

#### Art card display settings

![Art card display settings]

#### Input switching

![Input Switching]

[//]: # "--- Links -------------------------------------------------------------------------------"

[StreamMagic]: https://www.cambridgeaudio.com/row/en/products/streammagic
[Asset UPnP]: https://dbpoweramp.com/asset-upnp-dlna.htm
[Vibin]: ../media/vibin/images/playlist_detailed.jpg
[overview video]: ../media/vibin/video/vibin.mp4
[Vibin backend documentation]: https://github.com/mjoblin/vibin
[Developers README]: README_DEV.md
[Current track lyrics]: ../media/vibin/images/current_lyrics.jpg
[Current track AirPlay]: ../media/vibin/images/current_airplay.jpg
[Current track waveform]: ../media/vibin/images/current_waveform.jpg
[Playlist detailed view]: ../media/vibin/images/playlist_detailed.jpg
[Playlist summary view]: ../media/vibin/images/playlist_summary.jpg
[Playlist entry actions]: ../media/vibin/images/playlist_entry_actions.jpg
[Playlist manager]: ../media/vibin/images/playlist_manager.jpg
[Albums]: ../media/vibin/images/albums.jpg
[Albums tiny wall]: ../media/vibin/images/albums_tiny_wall.jpg
[Tracks filtered by lyrics]: ../media/vibin/images/tracks_filtered_happy.jpg
[Tracks filtered by title]: ../media/vibin/images/tracks_filtered_love.jpg
[Favorites]: ../media/vibin/images/favorites.jpg
[Presets]: ../media/vibin/images/presets.jpg
[Media filtering]: ../media/vibin/images/general_search.jpg
[Art card display settings]: ../media/vibin/images/general_card_display.jpg
[Input Switching]: ../media/vibin/images/general_input_switching.jpg

[//]: # "--- Styles ------------------------------------------------------------------------------"

<style>
img[alt="Playlist entry actions"] { width: 250px }
img[alt="Media filtering"] { width: 400px }
img[alt="Art card display settings"] { width: 250px }
img[alt="Input Switching"] { width: 200px }
</style>
