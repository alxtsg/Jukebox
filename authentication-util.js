/**
 * Authentication utility.
 *
 * @author alextsang@live.com
 */
module.exports = (function(){

  'use strict';

  /**
   * Generates authentication token.
   *
   * @return An authentication token.
   */
  var generateToken = function(){
      return 'secret-token';
    },

    /**
     * Checks if the given token is valid or not.
     *
     * @param {String} token Token to be checked.
     *
     * @return {Boolean} true if the given token is valid, false otherwise.
     */
    isTokenValid = function(token){
      var currentToken = generateToken();
      return (currentToken === token);
    };

  return {
    generateToken: generateToken,
    isTokenValid: isTokenValid
  };
}());
