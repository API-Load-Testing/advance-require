# advance-require

a customized version of require, used to override Nodes require() method,
providing administrative access

Info
----------- 
This came to being part of a project to run untrusted user code, so i needed a way to control what the user requires and how  
tested on node ver 4.4 to 6.2
  
  
  
this package gives you the following feutures:

  Upgrade Nodes require() method to support:
  
  Search Paths  
  reload modules  
  Blacklist  
  WhiteList  
  Enable/Disable External module reuire  
  Events:  
     onBeforeRequire  
    onRequire  
    onAfterRequire  
  Add new Extensions in a simple way  
  override module require  
  get a copy of required module  
    
  Also you can have upgraded require and nodes default require simultanusly
  
  
  
  
Installation
------------

    npm install advance-require

Usage
------


