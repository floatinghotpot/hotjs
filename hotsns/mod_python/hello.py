#!/usr/bin/python

from mod_python import apache

import memcache

appjson = "application/json"

def index(req):
    req.content_type = appjson
    req.write( "hello, world.\n" )
    #return apache.OK

def testmem(req):
    mc = memcache.Client(['127.0.0.1:11211'], debug=0)

    mc.set('foo', 'hello, world.\n', 300)
    str = mc.get('foo')
    req.write(str)

    mc.set('a', 1, 300)
    mc.incr('a', 1)
    n = mc.get('a')
    req.write( "n = {0}\n".format(n) )

    try:
        req.write(mc.get('b'))
    except:
        pass
    
    #return apache.OK
