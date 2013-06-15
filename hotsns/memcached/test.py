#!/usr/bin/python

import memcache

mc = memcache.Client(['127.0.0.1:11211'], debug=0)
mc.set('foo', 'hello, world.', 300)
str = mc.get('foo')
print( str )

mc.set('a', 1, 300)
mc.incr('a', 1)
n = mc.get('a')
print( n )

print( mc.get('b') )
