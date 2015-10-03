/**
 * Playlists API.
 *
 * References:
 * http://en.wikipedia.org/wiki/PLS_(file_format)
 * http://schworak.com/blog/e41/extended-pls-plsv2/
 * http://en.wikipedia.org/wiki/Advanced_Stream_Redirector
 * https://msdn.microsoft.com/en-us/library/dd564668(v=vs.85).aspx
 *
 * @author alextsang@live.com
 */
module.exports = (function () {

  'use strict';

  var authenticationUtil = require('./authentication-util.js'),

    fs = require('fs'),

    express = require('express'),
    xml = require('xml'),

    router = express.Router(),

    /**
     * Builds track URL.
     *
     * @param {Object} components An object with the following properties:
     *                            protocol - HTTP or HTTPS.
     *                            hostname - Server hostname.
     *                            port - Port number of server. Set to null to
     *                            	disable including port number in URL.
     *                            appBasePath - Application URL base path.
     *                            trackName - Track name, including file
     *                            	extension.
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
        .concat(encodeURIComponent(components.trackName))
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
        tracksDirectory = request.app.locals.tracksDirectory,
        token = authenticationUtil.generateToken();
      fs.readdir(tracksDirectory, function (error, files) {
        if (error !== null) {
          console.error('Unable to get read tracks directory.');
          console.error(error);
          response.statusCode = 500;
          response.type('text/plain');
          response.end('INTERNAL_ERROR');
          return;
        }
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
        files.forEach(function (file, fileIndex) {
          var index = fileIndex + 1;
          response.write('File' + index + '=' + buildTrackUrl({
            protocol: request.protocol,
            hostname: request.hostname,
            port: port,
            appBasePath: request.app.locals.appBasePath,
            trackName: file,
            token: token
          }));
          response.write('\n');
          response.write('Title' + index + '=' + file);
          response.write('\n');
        });
        response.write('NumberOfEntries=' + files.length);
        response.write('\n');
        response.write('Version=2');
        response.end();
      });
    },

    /**
     * Generates music playlist in ASX format.
     *
     * @param {Object} request HTTP request.
     * @param {Object} response HTTP response.
     */
    getPlaylistAsASX = function (request, response) {
      var port = null,
        tracksDirectory = request.app.locals.tracksDirectory,
        token = authenticationUtil.generateToken(),
        asxObject = {
          asx: [
            {
              _attr: {
                version: '3.0'
              }
            },
            {
              title: 'Music'
            }
          ]
        };
      fs.readdir(tracksDirectory, function (error, files) {
        if (error !== null) {
          console.error('Unable to get read tracks directory.');
          console.error(error);
          response.statusCode = 500;
          response.type('text/plain');
          response.end('INTERNAL_ERROR');
          return;
        }
        response.statusCode = 200;
        response.type('video/x-ms-asf');
        if (request.protocol === 'http') {
          if (request.app.locals.httpPortInUrl !== null) {
            port = request.app.locals.httpPortInUrl;
          }
        } else if (request.protocol === 'https') {
          if (request.app.locals.httpsPortInUrl !== null) {
            port = request.app.locals.httpsPortInUrl;
          }
        }
        files.forEach(function (file) {
          var url = buildTrackUrl({
              protocol: request.protocol,
              hostname: request.hostname,
              port: port,
              appBasePath: request.app.locals.appBasePath,
              trackName: file,
              token: token
            });
          asxObject.asx.push({
            entry: [
              {
                title: file
              },
              {
                ref: [
                  {
                    _attr: {
                      href: url
                    }
                  }
                ]
              }
            ]
          });
        });
        response.write(xml(asxObject));
        response.end();
      });
    };

  router.get('/music.pls', getPlaylistAsPLS);
  router.get('/music.asx', getPlaylistAsASX);

  return router;
}());
