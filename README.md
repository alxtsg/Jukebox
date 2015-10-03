# Jukebox #

## Description ##

A simple Node.js application for serving music playlists and music files. Jukebox doesn't do any transcoding of music files, those files are served as-is.

## Requirements ##

* Node.js (`>=0.10.35`).
* express (`>=4.13.3`).

## Installation ##

0. Install Node.js.
1. Install the application by `npm install`.
2. Start the application by `node index.js`.

## Usage ##

The configuration file `config.json` controls the following:

* `appBasePath`: The application base path to be included in URLs of music playlists and music files. Set to either an empty string, or a string begins with a slash but without trailing slash. This option is useful when Jukebox is placed behind a reverse proxy (e.g. nginx) and you want to redirect traffic based on URL path.
* `tracksDirectory`: The directory where music files are located. The directory must contain music files only, sub-directory is not supported.
* `tls`: Controls HTTPS-related parameters.
    * `isEnabled`: Set to `true` if you want to access Jukebox over HTTPS, or `false` if you don't plan to access Jukebox over HTTPS.
    * `certificate`: Path to TLS public certificate file. Ignored if `isEnabled` is set to `false`.
    * `key`: Path to TLS private key file. Ignored if `isEnabled` is set to `false`.
* `httpPortInUrl`: The HTTP port number to be included in generated URLs of music files. Set to `null` if you don't want to include port number in generated URLs. This option is useful when Jukebox is directly accessible (i.e. not behind a reverse proxy). The value is usually same as `httpPort`.
* `httpsPortInUrl`: Similar to `httpPortInUrl` but for requests over HTTPS. Ignored if `isEnabled` in `tls` is set to `false`. The value is usually same as `httpsPort`.
* `httpPort`: The port which Jukebox listens for incoming HTTP traffic, e.g. `8080`.
* `httpsPort`: The port which Jukebox listens for incoming HTTPS traffic, e.g. `8443`. Ignored if `isEnabled` in `tls` is set to `false`.

Jukebox supports generating playlists in the following formats:

* [PLS](http://en.wikipedia.org/wiki/PLS_(file_format)): Recognized by many software, such as VLC media player.

The generated music playlist contains all music tracks found in the directory as specified in `tracksDirectory`.

All requests are expected to include a query parameter `token` in the URL. The default value is `secret-token`. You can modify the `generateToken` function in `authentication-util.js` to alter the token value. Moreover, you can even modify the `generateToken` function so that the token value is calculated at runtime (e.g. time-based). This is a simple (and perhaps naïve) authentication method to avoid unsolicited access to your music.

## Examples ##

Assuming Jukebox is running on local computer and you want to access Jukebox over HTTP:

* Set `appBasePath` set to an empty string (i.e. `""`).
* Both `httpPortInUrl` and `httpPort` set to `8080`.

The music playlist in PLS format can be obtained at:

[http://127.0.0.1:8080/playlists/music.pls?token=secret-token](http://127.0.0.1:8080/playlists/music.pls?token=secret-token)

Assuming Jukebox is running behind a reverse proxy located at example.com and you want to access Jukebox over HTTPS:

* Set `appBasePath` to `"/jukebox"`.
* Set `isEnabled` in `tls` to `true`.
* Set `certificate` and `key` in `tls` to the path of public certificate file and private key file respectively. Self-signed TLS certificate is accepted.
* Set `httpsPortInUrl` to `null`, because the URLs of music files should not contain port number as the port number is used between your reverse proxy and Jukebox only.
* Set `httpsPort` to a port number which Jukebox listens for HTTPS traffic, such as `8443`.
* Configure your reverse proxy to redirect HTTPS traffic to Jukebox if URL begins with `/jukebox`.

The music playlist in PLS format can be obtained at:

[https://example.com/jukebox/playlists/music.pls?token=secret-token](https://example.com/jukebox/playlists/music.pls?token=secret-token)

You can put the URL of music playlist in media players such as VLC media player or Windows Media Player, then the music playback should begin.

## Known issues ##

* (None)

## TODO ##

* Makes the token parameter to be optional.
* Accepts optional parameter to shuffle music in generated playlists.

## License ##

[The BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause)
