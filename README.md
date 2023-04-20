# `vibinui`

`vibinui` is a browser-based application for [StreamMagic] audio streamers. `vibinui` also requires
installation of the `vibin` backend.

Vibin was developed for one person's specific music streaming needs (mine). It should however work
for anyone with a StreamMagic streamer, but has only been tested with the following:

* Cambridge Audio CXNv2 streamer.
* Local media stored on a NAS running [Asset UPnP].
* AirPlay running on a Mac.
* Running Vibin in Chrome on a MacBook and iPad.

Vibin is not intended to be a complete replacement for the official StreamMagic apps. Vibin lacks
features such as browsing internet radio, and has no support for TIDAL or Qobuz.

&ensp;<br />
![Vibin]
&ensp;<br />

## Installation

See the [Vibin backend documentation] for information on how to install both the backend and this
UI.

## Developers

See the [Developers README] for more information.

## Features

Watch the [overview video] (4m:15s) to see Vibin's features in action.

Vibin supports:

* **Currently-playing information**.
  * Lyrics.
  * Waveform.
  * Links to external sites.
* **Playlists**.
  * View the active playlist.
  * Modify the active playlist.
  * Save and switch between playlists.
* **Browse local media**.
  * Artists, Albums, Tracks.
  * Search by title, date, genre, etc.
  * Search for lyrics.
  * Find the currently-playing track.
* **Presets** (like internet radio).
* **Favorites**.

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

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/playlist_entry_actions.jpg" width="250" />

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

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/general_search.jpg" width="400" />

#### Art card display settings

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/general_card_display.jpg" width="250" />

#### Input switching

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/general_input_switching.jpg" width="200" />


[//]: # "--- Links -------------------------------------------------------------------------------"

[StreamMagic]: https://www.cambridgeaudio.com/row/en/products/streammagic
[Asset UPnP]: https://dbpoweramp.com/asset-upnp-dlna.htm

[Vibin]: https://github.com/mjoblin/media/blob/main/vibin/images/albums.jpg?raw=true
[overview video]: https://www.youtube.com/watch?v=5fEWAWSNico
[Vibin backend documentation]: https://github.com/mjoblin/vibin
[Developers README]: README_DEV.md
[Current track lyrics]: https://github.com/mjoblin/media/blob/main/vibin/images/current_lyrics.jpg?raw=true
[Current track AirPlay]: https://github.com/mjoblin/media/blob/main/vibin/images/current_airplay.jpg?raw=true
[Current track waveform]: https://github.com/mjoblin/media/blob/main/vibin/images/current_waveform.jpg?raw=true
[Playlist detailed view]: https://github.com/mjoblin/media/blob/main/vibin/images/playlist_detailed.jpg?raw=true
[Playlist summary view]: https://github.com/mjoblin/media/blob/main/vibin/images/playlist_summary.jpg?raw=true
[Playlist manager]: https://github.com/mjoblin/media/blob/main/vibin/images/playlist_manager.jpg?raw=true
[Albums]: https://github.com/mjoblin/media/blob/main/vibin/images/albums.jpg?raw=true
[Albums tiny wall]: https://github.com/mjoblin/media/blob/main/vibin/images/albums_tiny_wall.jpg?raw=true
[Tracks filtered by lyrics]: https://github.com/mjoblin/media/blob/main/vibin/images/tracks_filtered_happy.jpg?raw=true
[Tracks filtered by title]: https://github.com/mjoblin/media/blob/main/vibin/images/tracks_filtered_love.jpg?raw=true
[Favorites]: https://github.com/mjoblin/media/blob/main/vibin/images/favorites.jpg?raw=true
[Presets]: https://github.com/mjoblin/media/blob/main/vibin/images/presets.jpg?raw=true
