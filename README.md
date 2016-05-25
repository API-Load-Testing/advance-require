# ADVANCE-REQUIRE
a customized version of require, used to override Nodes require() method,
providing administrative access


## Info
This came to being as part of a project to run untrusted user code,
so i needed a way to control what the user requires and how

tested on node ver 4.4 to 6.2

This package gives you the following feutures:

**Upgrade Nodes require() method to support:**
  * [Search Paths](#path)
  * [reload modules](#reload)
  * [Blacklist](#blacklist)
  * [WhiteList](#whitelist)
  * [Enable/Disable External module reuire](#allowexternal)
  * [Events](#events)
     * [onBeforeRequire](#onbeforerequire)
     * [onRequire](#onrequire)
     * [onAfterRequire](#onafterrequire)
  * [Add new Extensions in a simple way](#extensions)
  * [override require of some modules](#override)
  * [get a copy of required module](#usecopy)

**Also you can have upgraded require and nodes default require simultanusly**

## Installation
For single project installation
> npm install --save advance-require

For global installation
> npm install -g advance require


## Usage

```js

var Advance_Require = require('advance-require');
var options = new Advance_Require.options();

/* 

  Set the options based on your need
  
*/


// 1. to upgrade nodes default require method with provided options
 Advance_Require.upgradeNodeRequire(options);


// 2. to restore nodes default require method
 Advance_Require.restoreNodeRequire();



// 3. to get an advanced require method without upgrading the nodes default metod
 var myrequire = Advance_Require.getAdvanceRequire(module, options);

//  Note the use of "module" in above line, its a handle to parent 
//  object as it is the current module, so always use it this way

```


# options
To set the behavior of the require method, 
here is a list of methods and properties of the options object  
**Note:** Changes to options will take effect immidietly on modules its linked to  
 This means you can *upgradeNodeRequire* then set the options

### Path
This will add search paths to require, solving lots of "../../../lib" like problems  

```js
 options.addPath('C:\\');
 options.addPath('..\\..\\..\\lib');
 options.addPath('.\\modules');
 options.addPath('/home/user/files/lib');
 
 /*
     after apllying these options, insted of:
        require('..\\..\\..\\lib\\mymodule');
     just write:
        require('mymodule');
 */
```
  
### Reload
For efficiency node loads each module only once and for later calls only returns a  
reference to that object, if you need to run a module multiple times, or you need  
to get multiple objects that are different, use reload to force reload of modules  
on each call  
**Note:** this does not work on Nodes native modules

```js
 
 options.reload = true;
 
 Advance_Require.upgradeNodeRequire(options);
  
 var obj1 = require('someExternalModule');
 var obj2 = require('someExternalModule');
 
 obj1.TestItem = 100;
 obj2.TestItem = 200;
 
 console.log(obj1.TestItem);  // prints 100
 console.log(obj2.TestItem);  // prints 200
 
 // this operation without reload option will result to only one shared 
 // object so the output would become : 200 200
 
```


### Blacklist
Its good if you want to prevent loading of some modules, let say you provide a
VM to run user code, but dont want to let user access 'fs' or 'process'
 
```js
 options.addBlacklist('fs');
 options.addBlacklist('vm');
 options.addBlacklist('module');   // this one is important for preventing the  
                                   // override of default module and using new require

 Advance_Require.upgradeNodeRequire(options);
 
 require('fs');  // throws Error: use of module fs is restricted
```

### WhiteList
oposite of blacklist, only allows require of modules granted, default is all modules

```js
 options.addWhitelist('path');
 options.addWhitelist('fs');
 options.addWhitelist('my_local_module');
 options.addWhitelist('http');
 options.addWhitelist('express');
 
 Advance_Require.upgradeNodeRequire(options);
 
 var fs = require('fs');             // Loads normally
 
 var express =  require('express');  // Throws Error because express uses lots of other 
                                     // modules internally that are not listed here
 
 // Note: when using this option be sure to add all dependencies of your modules  
```

### AllowExternal
Enables/Disables use of modules other than Nodes-Native modules

```js
 options.allowExternalModules = false;  // Only Native_Node Modules are allowd
 
```

### Events
There are two ways to set listners for events:  
  * Using the options.on() method  
  * using special event listener methods  
both do the same job  

There are 3 Events that will fire on a require operation:
    
#### onBeforeRequire
     this event fires before running the require operation passing the  
     moduleName to the event listener, this is good for logging or filter  
     operations  
     **Note:** This will run only on allowd modules, meaning Blacklist,  
             Whitelist, AllowExternal operations are done first  
     
#### onRequire
     this event fired while doing the require operation, passing the filename,  
     source, requiredModule refrence to the event listner  
     you can change the source or the requiredModule object here resulting on  
     a new object
     
#### onAfterRequire
     this event fires after complition of require operation and just before   
     returning the resulted object to the caller module, the listner will recive  
     a handle to requiredModule so it can make changes to the object
     
one can have as many Event listners and they run in the order they are added

```js
//......
```
     
     
```js
     
Sorry Im really tired, will write the rest of this manual tomorrow
      
      
//  * [Add new Extensions in a simple way](#extensions)
//  * [override require of some modules](#override)
//  * [get a copy of required module](#usecopy)
 
```
