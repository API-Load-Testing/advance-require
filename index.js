'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var NodeModule = require('module');
var NodeDefaultMethods = {};
var _NATIVE_MODULES = ['assert', 'buffer', 'child_process', 'constants', 'crypto', 'tls', 'dgram', 'dns', 'http', 'https', 'net', 'querystring', 'url', 'domain', 'events', 'fs', 'path', 'module', 'os', 'punycode', 'stream', 'string_decoder', 'timers', 'tty', 'util', 'sys', 'vm', 'zlib'];

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
    }
};


var options = function () {

    this.useCopy = false;
    this.reload = false;
    this.allowExternalModules = true;


    var onBeforeRequire = [];
    this.addOnBeforeRequire = function (method) {
        if (!method) return;
        if (_.isFunction(method) && onBeforeRequire.indexOf(method) < 0)
            onBeforeRequire.push(method);
    }
    this._getOnBeforeRequire = function () {
        return onBeforeRequire;
    }


    var onRequire = [];
    this.addOnRequire = function (method) {
        if (!method) return;
        if (_.isFunction(method) && onRequire.indexOf(method) < 0)
            onRequire.push(method);
    }
    this._getOnRequire = function () {
        return onRequire;
    }


    var onAfterRequire = [];
    this.addOnAfterRequire = function (method) {
        if (!method) return;
        if (_.isFunction(method) && onAfterRequire.indexOf(method) < 0)
            onAfterRequire.push(method);
    }
    this._getOnAfterRequire = function () {
        return onAfterRequire;
    }


    this.on = function (eventName, method) {
        if (!method) return;
        if (!_.isFunction(method)) return;
        if (_.toUpper(eventName) === 'ONBEFOREREQUIRE') this.addOnBeforeRequire(method);
        else if (_.toUpper(eventName) === 'ONREQUIRE') this.addOnRequire(method);
        else if (_.toUpper(eventName) === 'ONAFTERREQUIRE') this.addOnAfterRequire(method);
    }


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


    var extentionList = {};  // {Extension: [Method1, ..., MethodN]}
    this.addExtension = function (ext, method) {

        verify.method(method);
        verify.extension(ext);

        if (!extentionList[ext]) extentionList[ext] = [];
        if (extentionList[ext].indexOf(method) < 0) {
            extentionList[ext].push(method);
        }
    };
    this.removeExtension = function (ext, method) {

        verify.extension(ext);
        if (!_.isFunction(method)) method = null;

        if (!extentionList[ext]) return;
        if (!_.isArray(extentionList[ext])) return;
        if (method === null) delete extentionList[ext];
        else {
            var extIndex = extentionList[ext].indexOf(method);
            if (extIndex >= 0) extentionList[ext].splice(extIndex, 1);
        }
    };
    this._getExtensionList = function () {
        return extentionList;
    };


    var pathList = [];
    this.addPath = function (newPath) {

        verify.string(newPath);
        var absolutePath = path.resolve(newPath);
        if (pathList.indexOf(absolutePath) < 0)
            pathList.push(absolutePath);
    };
    this._getPathList = function () {
        return pathList;
    }


    var overrideList = {};  // {ModuleName, Method}
    this.addOverrideModule = function (moduleName, method) {

        verify.method(method);
        verify.string(moduleName);
        overrideList[moduleName] = method;
    };
    this.removeOverrideModule = function (moduleName, method) {

        verify.extension(ext);
        if (!_.isFunction(method)) method = null;

        if (overrideList[moduleName]) {

            if (method === null || method === overrideList[moduleName])
                delete overrideList[method];
        }
    };
    this._getOverrideModuleList = function () {
        return overrideList;
    }


}


//------------------------------------------------------------------------------

function saveNodeDefaults() {

    NodeDefaultMethods.require = NodeModule.prototype.require;
    NodeDefaultMethods.NODE_PATH = process.env['NODE_PATH'];
    NodeDefaultMethods.extensions = moduleObj._extensions.slice(0);
}

function ApplyAdvanceOptions(moduleObj, userOptions) {

    if (moduleObj.upgradedToAdvanced) return;
    if (moduleObj === NodeModule) saveNodeDefaults();


    // --- Start Upgrade Operation ------
    // Apply Search Paths & New Extensions
    ApplySearchPaths(moduleObj, userOptions);
    ApplyExtensions(moduleObj, userOptions);


    // --  overriding default require
    var originalRequire = moduleObj.prototype.require;
    moduleObj.prototype.require = function (moduleName) {

        verify.string(moduleName);

        // this is onBeforeRequire Event place
        // first BlackList, WhiteList, AllowExternal inner Controls
        // if passed these controls, call user defined eventListners
        if (userOptions.Blacklist.indexOf(moduleName) >= 0) {
            throw new Error('Use of module (' + moduleName + ') is restricted.');
        }

        if (userOptions.Whitelist.length > 0 && userOptions.Whitelist.indexOf(moduleName) < 0) {
            throw new Error('Module (' + moduleName + ') is not available.');
        }

        if (!userOptions.allowExternalModules && _NATIVE_MODULES.indexOf(moduleName) < 0) {
            throw new Error('Use of external modules is restricted, have (' + moduleName + ')');
        }

        // run onBefore require event listeners
        userOptions.onBeforeRequire.forEach(function (method) {
            method.call(this, moduleName)
        });


        // we shall not process modules in Override list,
        // thus we just hand the operation to the override method,
        // with modulename, absolute file name, and a handler to default require object
        var userResult = processOverrideList(moduleObj, userOptions, originalRequire);


        var filename = moduleObj._resolveFilename(moduleName, this, false);
        // Before starting require, clear cash for reload of modules
        if (userOptions.reload && _NATIVE_MODULES.indexOf(moduleName) < 0) {
            // only external modules can reload
            delete moduleObj._cache[filename];
        }

        // OK now the require Operation,
        // first require the module and read source
        // then pass the module and source for user usage
        var source = "";
        var requiredModule = null;

        if (userResult.newResult) {

            requiredModule = userResult.newResult;

        } else if (userResult.changeSource) {

            source = userResult.newSource;
            var tempModule = new moduleObj.Module(filename, this);
            tempModule._compile(source, filename);
            requiredModule = tempModule.exports;
        }
        else {
            source = stripBOM(fs.readFileSync(filename, 'utf8'));
            requiredModule = moduleObj._load(moduleName, this, /* isMain */ false);
        }


        // run onRequire event listeners
        userOptions.onRequire.forEach(function (method) {
            var userResult = method.call(this, moduleName, source, requiredModule);
            if (userResult) requiredModule = userResult;
        });


        //  use copy
        var ResultedModule = requiredModule;
        if (userOptions.useCopy) {
            ResultedModule = _.cloneDeep(requiredModule);
            requiredModule = null;
            if (_NATIVE_MODULES.indexOf(moduleName) < 0) {
                delete moduleObj._cache[filename];
            }
        }


        // just before returning the resulted module
        // run onAfterRequire event listeners
        userOptions.onAfterRequire.forEach(function (method) {
            method.call(this, ResultedModule, moduleName);
        });

        return ResultedModule;
    }

    moduleObj.upgradedToAdvanced = true;
}


function ApplySearchPaths(moduleObj, userOptions) {

    var paths = userOptions._getPathList();
    if (paths.length > 0) {

        var nodePath = process.env['NODE_PATH'];
        if (!nodePath) nodePath = ""; else nodePath += path.delimiter;
        for (var i = 0; i < paths.length; i++) {
            nodePath += paths[i] + path.delimiter;
        }
        moduleObj._initPaths();
    }
}


function ApplyExtensions(moduleObj, userOptions) {

    var extentionList = userOptions._getExtensionList;
    for (var ext in extentionList) {

        moduleObj._extensions[ext] = function (module, filename) {

            var source = stripBOM(fs.readFileSync(filename, 'utf8'));
            extentionList[ext].every(function (method) {
                var userResult = null;
                userResult = method(source, filename);
                if (!userResult || userResult === null) userResult = source;

                if (!_.isString(userResult)) {   // stop operation, return this value
                    module.exports = userResult;
                    return false;
                } else {
                    source = userResult;   // set the newly set ret value
                    return true;
                }
            });
            module._compile(source, filename);
        };
    }
};


function processOverrideList(moduleObj, userOptions, originalRequire) {

    var filename = "";
    try {
        filename = moduleObj._resolveFilename(moduleName, this, false);
    } catch (err) {
    }

    var overrideModuleList = userOptions._getOverrideModuleList();
    if (overrideModuleList[moduleName]) {
        var userResult = overrideModuleList[moduleName](moduleName, filename, originalRequire);
        if (userResult) {

            if (userResult.newSource && _.isString(userResult.newSource)) {
                return {newSource: userResult.newSource, changeSource: true}
            } else if (userResult.newResult) {
                return {newResult: userResult.newResult, changeSource: false}
            } else {
                return {noNewResult: true};
            }
        }
    }
}


function restoreDefault() {

    if (!NodeModule.upgradedToAdvanced) return;

    NodeModule._extensions = NodeDefaultMethods.extensions.slice(0);
    process.env['NODE_PATH'] = NodeDefaultMethods.NODE_PATH;
    NodeModule._initPaths();
    NodeModule.prototype.require = NodeDefaultMethods.require;
    delete NodeModule.upgradedToAdvanced;
}


//------- Helper Functions ----------------------------------------------------

function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return content;
}


//------------------------------------------------------------------------------

module.exports.options = options;

module.exports.upgradeNodeRequire = function (userOptions) {

    if (!userOptions) userOptions = new options();
    else if (!userOptions instanceof options) userOptions = new options();
    ApplyAdvanceOptions(NodeModule, userOptions);
}

module.exports.restoreNodeRequire = function () {
    restoreDefault(NodeModule);
}

module.exports.getAdvanceRequire = function (userOptions) {

    if (!userOptions) userOptions = new options();
    else if (!userOptions instanceof options) userOptions = new options();

    var copyNodeModule = _.cloneDeep(NodeModule);
    ApplyAdvanceOptions(copyNodeModule, userOptions);
    return copyNodeModule.require;
}
