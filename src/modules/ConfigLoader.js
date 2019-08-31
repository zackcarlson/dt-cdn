'use strict';

/**
 * ConfigLoader
 * @module
 * 
 * @description Centralizes loading and access of configuration values to reduce duplication.
 * @author Chris Cole
 * 
 * */

var env = require('../config/env.json').current;
var genConfig = require('../config/general.json');
var activeConfig = genConfig[env];
var helpers = require('./helpers');
var myConfig;

var loadDepth = 0; // beak over recursion

function loadConfig(settings) {
  loadDepth = 0;
  loadOver(settings, myConfig);
  return myConfig;
}


function loadOver(newVals, targetObject) {
  var otype = typeof (newVals);
  var k, v, vtype;
  var next;
  if (loadDepth++ > 7) {
    console.error('DigiTrust load config over recurse');
    return targetObject;
  }
  if (otype != 'object' || newVals == null) {
    return targetObject;
  }

  for (k in newVals) {
    if (newVals.hasOwnProperty(k)) {
      v = newVals[k];
      vtype = typeof (v);
      if (vtype == 'object') {
        if (targetObject[k] == null) {
          targetObject[k] = {};
        }
        next = targetObject[k]
        targetObject[k] = loadOver(v, next);
      }
      else {
        targetObject[k] = v;
      }
    }
  }

  return targetObject;
}

function clear() {
  myConfig = null;
  setBaseConfig();
}

function setBaseConfig() {
  var conf = Object.assign({}, genConfig['prod']);
  myConfig = conf
  // merge in activeConfig
  loadConfig(activeConfig);
  return myConfig;
}

/**
 * Gets a value from the config based upon a key.
 * Key can be of format keyA.keyB.keyX
 * @param {string} key
 */
function getVal(key) {
  return helpers.deepGet(myConfig, key);
}

setBaseConfig();

module.exports = {
  loadConfig: loadConfig,
  getValue: getVal,
  reset: clear,
  all: function () { return myConfig; }
}