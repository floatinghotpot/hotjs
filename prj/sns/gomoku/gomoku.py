#!/usr/bin/python

from mod_python import apache
import memcache

mc = memcache.Client(['127.0.0.1:11211'], debug=0)

appjson = "application/json"

def test(req):
  mc.set('foo', 'hello, world.', 300)
  str = mc.get('foo')
  req.write( str )

  mc.set('a', 1, 300)
  mc.incr('a', 1)
  n = mc.get('a')
  req.write( n )

  req.write( mc.get('b') )
  return apache.OK

def index(req):
    req.content_type = appjson
    req.write( "{}" )
    return apache.OK

def getColor(req):
    req.content_type = appjson
    return apache.OK
    
def changeColor(req):
    req.content_type = appjson
    return apache.OK

def confirmChangeColor(req):
    req.content_type = appjson
    return apache.OK

def setBoardSize(req):
    req.content_type = appjson
    return apache.OK
    
def go(req):
    req.content_type = appjson
    return apache.OK

def undo(req):
    req.content_type = appjson
    return apache.OK

def confirmUndo(req):
    req.content_type = appjson
    return apache.OK
    