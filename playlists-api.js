/**
 * Playlists API.
 *
 * References:
 * http://en.wikipedia.org/wiki/PLS_(file_format)
 * http://schworak.com/blog/e41/extended-pls-plsv2/
 *
 * @author alextsang@live.com
 */
module.exports = (function () {

  'use strict';

  var authenticationUtil = require('./authentication-util.js'),

    express = require('express'),

    router = express.Router(),

    /**
     * Shuffles an array.
     *
     * @param {Array} array An array of elements.
     *
     * @return {Array} An array with its elements shuffled.
     */
    shuffle = function (array) {
      var counter = array.length - 1,
        swapIndex = null,
        tempValue = null;
      while (counter > 0) {
        swapIndex = Math.floor(Math.random() * counter);
        tempValue = array[counter];
        array[counter] = array[swapIndex];
        array[swapIndex] = tempValue;
        counter -= 1;
      }
      return array;
    },

    /**
     * Builds track URL.
     *
     * @param {Object} components An object with the following properties:
     *                            protocol - HTTP or HTTPS.
     *                            hostname - Server hostname.
     *                            port - Port number of server. Set to null to
     *                            	disable including port number in URL.
     *                            appBasePath - Application URL base path.
     *                            trackIndex - Track index.
     *                            token - Authentication token.
     *
     * @return {String} Track URL.
     */
    buildTrackUrl = function (components) {
      var url = components.protocol
        .concat('://')
        .concat(components.hostname);
      if (components.port !== null) {
        url = url
          .concat(':')
          .concat(components.port);
      }
      url = url.concat(components.appBasePath)
        .concat('/tracks/')
        .concat(components.trackIndex)
        .concat('?token=')
        .concat(components.token);
      return url;
    },

    /**
     * Generates music playlist in PLS format.
     *
     * @param {Object} request HTTP request.
     * @param {Object} response HTTP response.
     */
    getPlaylistAsPLS = function (request, response) {
      var port = null,
        trackIndices = Object.keys(request.app.locals.tracksMap),
        token = authenticationUtil.generateToken();
      response.statusCode = 200;
      response.type('audio/x-scpls');
      response.write('[playlist]');
      response.write('\n');
      if (request.protocol === 'http') {
        if (request.app.locals.httpPortInUrl !== null) {
          port = request.app.locals.httpPortInUrl;
        }
      } else if (request.protocol === 'https') {
        if (request.app.locals.httpsPortInUrl !== null) {
          port = request.app.locals.httpsPortInUrl;
        }
      }
      // Shuffle the tracks if requested by client.
      if (request.query.shuffle === 'true') {
        trackIndices = shuffle(trackIndices);
      }
      trackIndices.forEach(function (trackIndex, index) {
        var trackName = request.app.locals.tracksMap[trackIndex];
        response.write('File' + (index + 1) + '=' + buildTrackUrl({
          protocol: request.protocol,
          hostname: request.hostname,
          port: port,
          appBasePath: request.app.locals.appBasePath,
          trackIndex: trackIndex,
          token: token
        }));
        response.write('\n');
        response.write('Title' + (index + 1) + '=' + trackName);
        response.write('\n');
      });
      response.write('NumberOfEntries=' + trackIndices.length);
      response.write('\n');
      response.write('Version=2');
      response.end();
    };

  router.get('/music.pls', getPlaylistAsPLS);

  return router;
}());
