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
    req.write( "{ \"done\":true } " )
    #return apache.OK

def _default_(req):
    req.content_type = appjson
    req.write( "{ \"api\":\"_default_\", \"done\":true }" )
    return apache.OK

def reigsterAccount(req):
    req.content_type = appjson
    return apache.OK
    
def deleteAccount(req):
    req.content_type = appjson
    return apache.OK

def login(req):
    req.content_type = appjson
    form = util.FieldStorage(req)
    
    name = form.getfirst("username")
    m = hashlib.md5()
    m.update( name  )
    req.write( "{" + "\"done\":true, \"sid\":\"{0}\" ".format( m.hexdigest() ) + "}" )
    #return apache.OK

def heartbeat(req):
    req.content_type = appjson
    form = util.FieldStorage(req)
    sid = form.getfirst("sid")
    req.write( "[" )
    #req.write( "{ \"api\": \"say\", \"sid\":\"" + sid +"\", \"who\":\"li4\", \"what\":\"hi, how are you?\" }" )
    req.write( "]" )
    #return apache.OK
    
def logout(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def changePassword(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def updateProfile(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def getProfile(req):
    req.content_type = appjson
    return apache.OK

def queryProfile(req):
    req.content_type = appjson
    return apache.OK

def listFriend(req):
    req.content_type = appjson
    return apache.OK

def addFriend(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def confirmAddFriend(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def removeFriend(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def listBlock(req):
    req.content_type = appjson
    return apache.OK

def block(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def unblock(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def setTag(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def getTag(req):
    req.content_type = appjson
    return apache.OK

def updateStatus(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def queryPresence(req):
    req.content_type = appjson
    return apache.OK

def searchUser(req):
    req.content_type = appjson
    return apache.OK

def searchUserComplex(req):
    req.content_type = appjson
    return apache.OK

def inviteJoinGroup(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def quitGroup(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def chat(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def enterRoom(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def leaveRoom(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def say(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK

def sms(req):
    req.content_type = appjson
    req.write( "{ \"done\":true } " )
    #return apache.OK
