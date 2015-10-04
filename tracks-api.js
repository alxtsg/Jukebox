/**
 * Tracks API.
 *
 * @author alextsang@live.com
 */
module.exports = (function () {

  'use strict';

  var path = require('path'),

    express = require('express'),

    router = express.Router(),

    /**
     * Gets a track.
     *
     * @param {Object} request HTTP request.
     * @param {Object} response HTTP response.
     */
    getTrack = function (request, response) {
      var trackName = request.app.locals.tracksMap[request.params.trackIndex],
        trackPath = null;
      if (trackName === undefined) {
        response.statusCode = 404;
        response.type('text/plain');
        response.end('TRACK_NOT_FOUND');
        return;
      }
      trackPath = path.join(
        request.app.locals.tracksDirectory,
        trackName
      );
      response.sendFile(
        trackPath,
        {
          lastModified: false
        },
        function (sendFileError) {
          if (sendFileError !== undefined) {
            console.error(sendFileError);
            response.statusCode = 500;
            response.end('INTERNAL_ERROR');
          }
        }
      );
    };

  router.get('/:trackIndex', getTrack);

  return router;
}());
