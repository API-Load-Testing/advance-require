'use strict';


var _ = require('lodash');
var path = require('path');
var NodeModule = require('module');


// var AVAILABLE_NATIVE_MODULES = ['assert', 'buffer', 'child_process', 'constants', 'crypto', 'tls', 'dgram', 'dns', 'http', 'https', 'net', 'querystring', 'url', 'domain', 'events', 'fs', 'path', 'module', 'os', 'punycode', 'stream', 'string_decoder', 'timers', 'tty', 'util', 'sys', 'vm', 'zlib'];
// if (_.isFunction(overrideMethod)) moduleObject = overrideMethod.call({}, moduleObject);

var verify = {
    extension: function (str) {
        if (!_.isString(str)) {
            throw new Error('expected string extension, have ' + str);
        }
        if (!str.startsWith('.')) {
            throw new Error('Extension should start with dot, for example .js, have ' + str);
        }
    },
    method: function (fn) {
        if (!_.isFunction(fn)) {
            throw new Error('method should be a function, have ' + fn);
        }
    },
    string: function (str) {
        if (!_.isString(str)) {
            throw new Error('expected string value, have ' + str);
        }
    },
    isPath: function (pathStr) {

        if (!_.isString(str)) {
            throw new Error('expected string path, have ' + str);
        }
        var PathObj = path.parse(pathStr);

        if (pathObj.dir === '' && base !== '..') {
            throw new Error('" ' + str + ' " is not a valid path');
        }

    }
};


var options = function () {

    this.useCopy = false;
    this.reload = false;
    this.allowExternalModules = true;

    this.onBeforeRequire = null;
    this.onRequire = null;
    this.onAfterRequire = null;


    this.Blacklist = [];
    this.addBlacklist = function (moduleName) {

        verify.string(moduleName);
        Blacklist.push(moduleName);
    };
    this.removeBlacklist = function (moduleName) {

        verify.string(moduleName);
        if (Blacklist.indexOf(moduleName) >= 0)
            Blacklist.splice(Blacklist.indexOf(moduleName), 1);
    };


    this.Whitelist = [];
    this.addWhitelist = function (moduleName) {

        verify.string(moduleName);
        whitelist.push(moduleName);
    };
    this.removeWhitelist = function (moduleName) {

        verify.string(moduleName);
        if (Whitelist.indexOf(moduleName) >= 0)
            Whitelist.splice(Blacklist.indexOf(moduleName), 1);
    };


    var extentionList = [];  // {Extension, Method}
    function getExtensionIndex(ext, method) {

        for (var i = 0; i < extentionList.length; i++) {
            if (extentionList[i].Extension === ext) {
                if (!method || method === null) return i;
                else if (method === extentionList[i].Method) return i;
            }
        }
        return -1;
    };
    this.addExtension = function (ext, method) {

        verify.method(method);
        verify.extension(ext);

        if (getExtensionIndex(ext, method) < 0) {
            extentionList.push({Extension: ext, Method: method});
        }
    };
    this.removeExtension = function (ext, method) {

        verify.extension(ext);
        if (!_.isFunction(method)) method = null;

        var extIndex = -1;
        do {
            var extIndex = getExtensionIndex(ext, method);
            if (extIndex >= 0) {
                extentionList.splice(extIndex, 1);
            }
        } while (extIndex >= 0);
    };


    var pathList = [];
    this.addPath = function (newPath) {

        verify.isPath(newPath);
        if (pathList.indexOf(newPath) < 0)
            pathList.push(newPath);
    };


    var overrideList = [];  // {ModuleName, Method}
    function getOverrideModuleIndex(moduleName, method) {

        for (var i = 0; i < overrideList.length; i++) {
            if (overrideList[i].ModuleName === moduleName) {
                if (!method || method === null) return i;
                else if (method === overrideList[i].Method) return i;
            }
        }
        return -1;
    };
    this.addOverrideModule = function (moduleName, method) {

        verify.method(method);
        verify.string(moduleName);

        if (getOverrideModuleIndex(moduleName, method) < 0) {
            overrideList.push({ModuleName: moduleName, Method: method});
        }
    };
    this.removeOverrideModule = function (moduleName, method) {

        verify.extension(ext);
        if (!_.isFunction(method)) method = null;

        var extIndex = -1;
        do {
            var extIndex = getOverrideModuleIndex(moduleName, method);
            if (extIndex >= 0) {
                overrideList.splice(extIndex, 1);
            }
        } while (extIndex >= 0);
    };


}



//------------------------------------------------------------------------------

function ApplyAdmin (moduleObj) {

    if (!moduleObj instanceof NodeModule) return;
    if (moduleObj.upgradedToAdmin) return;


    moduleObj
}




//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
module.exports.options = new options();

module.exports.upgradeNodeRequire = function() {

    ApplyAdmin(NodeModule);
}

module.exports.require_admin = function() {

    var copyNodeModule = _.cloneDeep(NodeModule);
    ApplyAdmin(copyNodeModule);
    return copyNodeModule.require;
}


module.exports.restoreNodeRequire = function () {
    restoreDefault(NodeModule);
}
