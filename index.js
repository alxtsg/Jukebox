/**
 * Main program.
 *
 * @author alextsang@live.com
 */
(function () {

  'use strict';

  var authenticationUtil = require('./authentication-util.js'),
    playlistsApi = require('./playlists-api.js'),
    tracksApi = require('./tracks-api.js'),

    fs = require('fs'),
    http = require('http'),
    https = require('https'),

    express = require('express'),

    app = express(),

    tlsOptions = {},

    readConfig = null,
    readTlsOptions = null,
    prepareTracksMap = null,
    startServer = null,

    /**
     * Authenticates incoming request. If the request is authentic, it is
     * accepted and handled by following middlewares, otherwise it is rejected
     * immediately without passing the request to the following middlewares.
     *
     * @param {Object} request HTTP request.
     * @param {Object} response HTTP response.
     * @param {Function} next The next middleware to be invoked.
     */
    authenticateRequest = function (request, response, next) {
      var token = request.query.token;
      if (token === undefined) {
        response.statusCode = 403;
        response.type('text/plain');
        response.end('MISSING_TOKEN');
        return;
      }
      if (!authenticationUtil.isTokenValid(token)) {
        response.statusCode = 403;
        response.type('text/plain');
        response.end('INVALID_TOKEN');
        return;
      }
      next();
    };

  /**
   * Reads configuration file.
   */
  readConfig = function () {
    fs.readFile(
      'config.json',
      {
        encoding: 'utf8'
      },
      function (readConfigError, data) {
        var config = null;
        if (readConfigError !== null) {
          console.error('Unable to read configuration file.');
          console.error(readConfigError);
          process.exit(1);
        }
        try {
          config = JSON.parse(data);
          app.locals.appBasePath = config.appBasePath;
          app.locals.tracksDirectory = config.tracksDirectory;
          app.locals.isTlsEnabled = config.tls.isEnabled;
          app.locals.httpPortInUrl = config.httpPortInUrl;
          app.locals.httpPort = config.httpPort;
          if (app.locals.isTlsEnabled) {
            app.locals.tlsCertificatePath = config.tls.certificate;
            app.locals.tlsKeyPath = config.tls.key;
            app.locals.httpsPortInUrl = config.httpsPortInUrl;
            app.locals.httpsPort = config.httpsPort;
          }
        } catch (parseConfigError) {
          console.error('Unable to parse configuration file.');
          console.error(parseConfigError);
          process.exit(1);
        }
        if (app.locals.isTlsEnabled) {
          readTlsOptions(app.locals.tlsCertificatePath, app.locals.tlsKeyPath);
        } else {
          prepareTracksMap();
        }
      });
  };

  /**
   * Reads TLS certificate and key.
   *
   * @param {String} tlsCertificatePath TLS certificate path.
   * @param {String} tlsKeyPath TLS key path.
   */
  readTlsOptions = function (tlsCertificatePath, tlsKeyPath) {
    fs.readFile(tlsCertificatePath, function (error, tlsCertificateContent) {
      if (error !== null) {
        console.error('Unable to read TLS certificate.');
        console.error(error);
        process.exit(1);
      }
      tlsOptions.cert = tlsCertificateContent;
      fs.readFile(tlsKeyPath, function (error, tlsKeyContent) {
        if (error !== null) {
          console.error('Unable to read TLS key.');
          console.error(error);
        }
        tlsOptions.key = tlsKeyContent;
        prepareTracksMap();
      });
    });
  };

  /**
   * Prepares tracks map for generating playlists.
   */
  prepareTracksMap = function () {
    fs.readdir(app.locals.tracksDirectory, function (readdirError, files) {
      var tracksMap = null;
      if (readdirError !== null) {
        console.error('Unable to get the list of tracks.');
        console.error(readdirError);
        process.exit(1);
      }
      tracksMap = {};
      files.forEach(function (file, index) {
        tracksMap[index] = file;
      });
      app.locals.tracksMap = tracksMap;
      startServer();
    });
  };

  /**
   * Starts server.
   */
  startServer = function () {
    // Disable several headers.
    app.disable('etag');
    app.disable('x-powered-by');
    // Authenticate all incoming requests.
    app.use(authenticateRequest);
    // Mount APIs.
    app.use(app.locals.appBasePath + '/playlists', playlistsApi);
    app.use(app.locals.appBasePath + '/tracks', tracksApi);
    http.createServer(app).listen(app.locals.httpPort);
    if (app.locals.isTlsEnabled) {
      https.createServer(tlsOptions, app).listen(app.locals.httpsPort);
    }
  };

  // Begin by reading configuration file.
  readConfig();
}());
