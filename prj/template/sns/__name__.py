#!/usr/bin/python

from mod_python import apache, util
import memcache
import json
import hashlib
import md5

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
    msg = { 'done':True, 'sid': sid };
    req.write( json.dumps(msg) )
    #return apache.OK

def _default_(req):
    form = util.FieldStorage(req, keep_blank_values=1)
    api = form.getfirst("api")
    param = json.loads( form.getfirst("param") )

    req.content_type = appjson
    msg = { 'done':True, 'sid': sid };
    req.write( json.dumps(msg) )
    #return apache.OK
    
