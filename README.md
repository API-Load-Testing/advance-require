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

<<<<<<< HEAD
var tempVar = require('some_module');
=======
>>>>>>> origin/master

// 2. to restore nodes default require method
 Advance_Require.restoreNodeRequire();



// 3. to get an advanced require method without upgrading the nodes default metod
 var myrequire = Advance_Require.getAdvanceRequire(module, options);
<<<<<<< HEAD
 
 var tempVar = myrequire('some_module');
=======
>>>>>>> origin/master

//  Note the use of "module" in above line, its a handle to parent 
//  object as it is the current module, so always use it this way

```


# options
To set the behavior of the require method, 
here is a list of methods and properties of the options object  
<<<<<<< HEAD
**Note:** Changes to options will take effect immediately on modules its linked to  
=======
**Note:** Changes to options will take effect immidietly on modules its linked to  
>>>>>>> origin/master
 This means you can *upgradeNodeRequire* then set the options

### Path
This will add search paths to require, solving lots of "../../../lib" like problems  
<<<<<<< HEAD
**Attention:** Changes to path does not take effect immediately, add paths before   
            linking the options to node    
=======

>>>>>>> origin/master
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

<<<<<<< HEAD
### Whitelist
=======
### WhiteList
>>>>>>> origin/master
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
<<<<<<< HEAD
   this event fires before running the require operation passing the  
   moduleName to the event listener, this is good for logging or filter  
   operations  
   **Note:** This will run only on allowd modules, meaning Blacklist,  
           Whitelist, AllowExternal operations are done first  
     
        usage:  options.addOnBeforeRequire(function);  
        listener: function (moduleName)  
        result: no output result is expected
        
   
#### onRequire
   this event fired while doing the require operation, passing the moduleName,  
   source, requiredModule refrence to the event listner  
   you can change the source or the requiredModule object here resulting on  
   a new object
     
       usage:  options.addOnRequire(function)  
       listner:  function (moduleName, source, requiredModule)  
       result:  if any result is available, it will be considered as the  
                require module resulted object, and overrides other operations

        
#### onAfterRequire
   this event fires after complition of require operation and just before   
   returning the resulted object to the caller module, the listner will recive  
   a handle to requiredModule so it can make changes to the object
        
        usage: options.addOnAfterRequire(function)
        listner:  function (ResultedModule, moduleName)
        result:  no output result is expected


#### options.on
   this function is used to set the event handlers, and does the same as 3 above:
   
       usage: options.on(eventName, function)
       eventName is one of : 
                "onBeforeRequire"
                "onRequire"
                "onAfterRequire"
       listner function signature is as discribed above

one can have as many Event listners and they run in the order they are added

Events Example
--------------

```js
 
'use strict';
 
 var Advance_Require = require('advance-require');
 var options = new Advance_Require.options();
 
 //-------- set the events
 options.addOnBeforeRequire(myModuleNameLogger);
 options.addOnBeforeRequire(myModuleFilters);
 
 options.addOnRequire(mySourceLogger);
 options.addOnRequire(myModuleSwitch);
 
 options.addOnAfterRequire(myAddItemsToModule);
 
 //---- Link Node Require with provided options
 Advance_Require.upgradeNodeRequire(options);
 
 //---- the listener functions
 
 function myModuleNameLogger (moduleName) { // moduleName is the exact argument provided by user
 
     if (typeof moduleName !== 'string')
         throw new Error('Module Name must be string');
     console.log('+ Module : ', moduleName + ' requested');
 }
 
 function myModuleFilters(moduleName) {
     if (moduleName === 'fs')
         throw new Error('use of [fs] is restricted');
     else if (moduleName === 'My_Special_Module') {
         console.log('The Special Module is Called, Lets Celebrate !');
     }
 }
 
 function mySourceLogger (moduleName, source, requiredModule) {
     console.log('---- This is the source logger ---');
     console.log('---- module: ', moduleName, ' has this source code: ');
     console.log(source);
     console.log('---- And the resulted object is: ', requiredModule);
 }
 
 function myModuleSwitch (moduleName, source, requiredModule) {
     if (moduleName === 'path') {
         var res = {
             message: 'if we return anything, the resulted Require object will change with that',
             Item1: 10,
             Item2: 'Lets add refrence to required method too',
             Item3: requiredModule
         }
         return res
     } else if (moduleName === 'my_external_module') {
         console.log('my External Module is Here, Lets add some items to it');
         var res = requiredMethod;
         res.newItem1 = 'This Is External module';
         res.newItem2 = 123;
 
         return res
     }
 }
 
 function myAddItemsToModule (ResultedModule, moduleName) {
 
     console.log('This is the last Stand');
     if (moduleName === 'os')
         ResultedModule.my_final: 'Controls';
     else if (moduleName === 'net' && ResultedModule)
         ResultedModule.myGithubAddr = 'https://github.com/API-Load-Testing/advance-require';
 }
 
 //------ The rest of the app
 
 //var fs = require('fs');      // Error: use of [fs] is restricted
 var path = require('path');
 console.log(path);           // the new items added to path
 var net = require('net');
 console.log(net);
 var http = require('http');
 var os = require('os');
 console.log(os);
 //var temp2 = require('My_Special_Module');  // after printing the celebrate message,
 //var temp = require('my_external_module');  // throws error Module not found !


```
     

     
### Extensions
Node only supports 3 default extensions: '.js', '.json', '.node',  
to support other extensions like '.xml', '.txt', ...  , one has to
write his own methods and add them to nodes extension list,  
Adding Extensions are made easier by extesion manager  
also one can have multiple functions for one extension,  
as long as they return a string as source for the next function


    usage:  options.addExtension(ext, function)
    ext: a file extension starting with .
    function:  the manager function that will handle the file,
               it recieves (source, filename) as string to process
    result:  the newSource is expected, that will be passed to next  
             handler function of this extension,  
             
             if the result is string after the last handler function,
             it will be compiled as a js code
             
             if the result is not String, the rest of the handlers are  
             ignored and the result is returned as the require methods result
             
Example
--------
```js

options.addExtension('.txt', function (source, filename) {
     return {source: source, filename: filename}
});

```



### Override
With this feature one can make any require command return his will,
let say if you want to change the source code before compile, or you  
might want to response to non existence modules with an object containig  
a message, or whatever you want

the override operation is done after the "OnBeforeRequire" event and  
just Before "OnRequir" event handlers

     usage: options.addOverrideModule(moduleName, function)
     moduleName: is the module to override
     function: is the handler function with parameters as:
               ( moduleName, filename, originalRequire )
     originalRequire is a refrence to the original node require method

its advanced so i just give a simple example code  
there are some advanced result options, they are not complete yet,  
so i will update the docs when make them more user friendly

Example
-------

```js

options.addOverrideModule('http', myOverrideMethod);
options.addOverrideModule('httpl', myOverrideMethod);
options.addOverrideModule('http5846', myOverrideMethod);

function myOverrideMethod(moduleName, filename, originalRequire) {

    if (moduleName === 'http') return(originalRequire('fs'));
    else if (moduleName === 'httpl') return(originalRequire('path'));
    else if (filename === "") return({hello: "world"});   // not available module will have a filename of ""
}

```


### Usecopy
with this option true, you will get a copy of the required method,  
and the original one will remain with node, its useful if you want  
to make changes on the version but not the main version 
 


Conclusion
==========
First of all: Writing this manual was harder than writing the code itself !  
  
Second: its in a beta state, so any bug reports, suggestions , ... are welcomed  
you can always contact me on my email: hassan.en.salari@gmail.com


Lastly and more importantly: 
I want to thank a friend whose supporting and encouraging me

###   Thank you **MEHDI** good old friend
    
=======
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
>>>>>>> origin/master
