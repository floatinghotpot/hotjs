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
    form = util.FieldStorage(req, keep_blank_values=1)
    api = form.getfirst("api")
    param = json.loads( form.getfirst("param") )
    req.content_type = appjson

    name = param['username']
    
    m = hashlib.md5()
    m.update( name  )
    sid = m.hexdigest();
    
    msg = { 'done':True, 'sid': sid };
    req.write( json.dumps(msg) )
    #return apache.OK

def heartbeat(req):
    form = util.FieldStorage(req, keep_blank_values=1)
    api = form.getfirst("api")
    param = json.loads( form.getfirst("param") )
    req.content_type = appjson

    sid = param['sid']

    req.write( "[" )
    # get all msg from inbox
    #req.write( json.dumps( param ) )
    req.write( "]" )
    #return apache.OK
    
def logout(req):
    form = util.FieldStorage(req, keep_blank_values=1)
    api = form.getfirst("api")
    param = json.loads( form.getfirst("param") )
    sid = param['sid']
    
    req.content_type = appjson
    msg = { 'done':True }
    req.write( json.dumps(msg) )
    #return apache.OK

def changePassword(req):
    form = util.FieldStorage(req, keep_blank_values=1)
    api = form.getfirst("api")
    param = json.loads( form.getfirst("param") )
    req.content_type = appjson

    msg = { 'done':True }
    req.write( json.dumps(msg) )
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
