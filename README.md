# `vibinui`

`vibinui` is a browser-based user interface for [StreamMagic] audio streamers. `vibinui` also
requires installation of the [`vibin`](https://github.com/mjoblin/vibin) backend.

Vibin was developed for my specific music streaming needs. It should however work for anyone with a
StreamMagic audio streamer, but has only been tested with the following:

* Cambridge Audio CXNv2 streamer.
* Local media stored on a NAS running [Asset UPnP] (local media is optional).
* AirPlay from a MacBook.
* Running the UI in Chrome on a MacBook and iPad.

> Vibin is not intended to be a complete replacement for the official StreamMagic apps. Vibin lacks
> features like browsing internet radio (although it can play internet radio presets configured in
> the StreamMagic app), and has no support for TIDAL or Qobuz. Nor is Vibin intended to replace
> general-purpose solutions like Plex, Audirvana, Roon, etc.

Watch the [overview video] (4m:15s) to see Vibin's features in action.

&ensp;<br />
![Vibin]
&ensp;<br />

## Installation

See the [Vibin backend documentation] for complete information on how to install both the backend
and this UI.

In summary:

1. Install the [`vibin`](https://github.com/mjoblin/vibin) backend first.
2. Use the backend's commandline interface to download and install the UI application onto the
   backend.

The backend will then be able to serve the UI to a browser running on any other device on the same
network (a laptop, iPad, etc) via a URL hosted on the backend, such as `http://192.168.1.100/ui`.

The backend expects to be installed on an always-on machine on the network (such as a server or
Raspberry Pi), to ensure it's always available to any browser running on any other device on the
network. This is not strictly required however, and it's possible to run everything on (say) a
single laptop.

## Developers

See the [Developers README] for more information.

## Features

Vibin's features include:

* **Showing what's currently playing on the streamer**.
  * Track details.
  * Album art.
  * Lyrics.
  * Waveform.
  * Related links to external sites.
* **Streamer transport controls**.
  * Play, pause, next track, previous track, shuffle, repeat, etc.
* **Browsing local media**.
  * Viewing Artists, Albums, and Tracks.
  * Filtering.
  * Searching by title, date, genre, etc.
  * Searching for lyrics.
* **Playlists**.
  * Viewing and interacting with the active streamer Playlist.
  * Saving and switching between stored Playlists.
* **Presets** (like internet radio).
* **Favorites**.

### Additional features

* Display settings are remembered between browser sessions.
* Keyboard shortcuts for transport controls, lyrics display, etc.
* Streamer can be powered on/off, and the audio source can be changed.
* Streamer changes made by other apps (like the StreamMagic app) will be automatically reflected in
  Vibin.
* Multiple instances of the UI can be running on one or more devices at once. Changes made by one
  device will be automatically reflected on the other devices.

## Examples

### Currently-playing information

Vibin shows information on the currently-playing track. This works for both local media and AirPlay
(although the waveform is not shown for AirPlay).

#### Lyrics

Lyrics are shown for the currently-playing track (when available).

![Current track lyrics]

#### Lyrics from AirPlay source

Lyrics will also be shown for tracks not coming from local media (such as AirPlay).

![Current track airplay]

#### Waveform

A waveform is shown for tracks sourced from local media. The playhead position can be changed by
dragging the playhead over the waveform image.

![Current track waveform]

### Playlists

Vibin supports custom Playlist creation. Playlists can be saved for later use. The detailed
Playlist view shows more information than the summary view.

#### Detailed view

![Playlist detailed view]

#### Summary view

![Playlist summary view]

#### Playlist entry actions

Various actions can be performed on each entry in the playlist.

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/playlist_entry_actions.jpg" width="250" />

#### Playlist management

Playlist names can be changed, and playlists can be removed.

![Playlist manager]

### Browse local media

Local media (stored on a NAS) can be browsed by Artist, Album, and Track. Media browsing supports
filtering.

#### View all albums

![Albums]

#### View albums as a tiny wall

The art size can be changed.

![Albums tiny wall]

#### View artists

The Artists screen provides an artist-oriented display of albums and tracks.

![Artists]

#### Filter tracks by title

Media can be filtered by various fields, such as title, artist, genre, date, etc.

![Tracks filtered by title]

#### Filter tracks by lyrics

Tracks can be filtered by lyrics. The following shows tracks with lyrics containing the word
"happy".

![Tracks filtered by lyrics]

### Presets

Vibin supports playing of StreamMagic Presets, like internet radio stations.

![Presets]

### Favorites

Albums and Tracks can be favorited.

![Favorites]

### General features

Vibin supports additional features including filtering, art display settings, input switching, and
more.

#### Media filtering

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/general_search.jpg" width="400" />

#### Art card display settings

The size and spacing of the art cards can be changed independently for Albums, Tracks, Presets, and
Favorites. Text details can be turned on and off. These settings will be remembered between
sessions.

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/general_card_display.jpg" width="250" />

#### Input switching

The streamer's audio input source can be set.

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
[Artists]: https://github.com/mjoblin/media/blob/main/vibin/images/artists.jpg?raw=true
[Tracks filtered by lyrics]: https://github.com/mjoblin/media/blob/main/vibin/images/tracks_filtered_happy.jpg?raw=true
[Tracks filtered by title]: https://github.com/mjoblin/media/blob/main/vibin/images/tracks_filtered_love.jpg?raw=true
[Favorites]: https://github.com/mjoblin/media/blob/main/vibin/images/favorites.jpg?raw=true
[Presets]: https://github.com/mjoblin/media/blob/main/vibin/images/presets.jpg?raw=true
