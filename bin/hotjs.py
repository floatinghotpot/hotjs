#!/usr/bin/env python

"""Utilities for common tasks needed to use hotjs framework.
"""

import optparse
import subprocess
import logging
import sys
import os.path
import zipfile
import re
import shutil
import fileinput
import mimetypes
from os.path import join, splitext, split, exists
from shutil import copyfile
from datetime import datetime
import base64
import json

if sys.version_info[0]==3:
    from urllib.request import urlretrieve
else :
    from urllib import urlretrieve


basedir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
curdir = os.path.abspath('.')

projects_path = join(basedir,'bin/projects')

def removeDupes(seq):
    # Not order preserving
    keys = {}
    for e in seq:
        keys[e.rstrip()] = 1
    return keys.keys()
    
def makeProjectPaths(add):
    lines = open(projects_path,'r').readlines()
    if len(add):
        lines.append(add)
    newlines = filter(lambda x: exists(join(basedir,x.rstrip())) and len(x.rstrip()),lines)
    newlines = removeDupes(newlines)
    
    f = open(projects_path,'w')
    f.write('\n'.join(newlines))
    f.close()
    
def escapeSpace(s):
    return s.replace(" ","\\ ")
    
def quoteSpace(s):
    return s.replace(" ","' '")

def create(name):
    
    path = os.path.join(curdir, name)
    
    name = os.path.basename(path)
    
    if exists(path):
        logging.error('Directory already exists: %s',path)
        sys.exit(1) 
    
    proj = os.path.relpath(path,basedir)
    
    shutil.copytree(os.path.join(basedir,'apps/template'),path)
    
    for root, dirs, files in os.walk(path):
        for fname in files:
            newname = fname.replace('__name__',name)
            if fname.find("__name__")!=-1:
                os.rename(os.path.join(path,fname),os.path.join(path,newname))
            for line in fileinput.FileInput(os.path.join(path,newname),inplace=1):
                line = line.replace('{name}',name)
                print(line.rstrip())
            
    print ('Created %s' % path)
    
    
    if proj!='.':
        makeProjectPaths(os.path.relpath(path,basedir))

def build(name,options):
    pass

def update():
    hotjs_path = join(basedir,'hotjs/')
    hotjslist_path = join(hotjs_path,'files')
    hotjsbin_path = join(hotjs_path,'hotjs-bin.js')

    print( "updating hotjsbin: " + hotjsbin_path )
    f = open(hotjsbin_path,'w')
        
    hotjslist = open(hotjslist_path,'r').readlines()
    for line in hotjslist:
        name = line.strip()
        if( len(name) > 0 ):
            jspath = os.path.join(hotjs_path, name)
            if( exists(jspath) ):
                print( "adding " + jspath )
                f.write('\n// ------- ' + name + ' ------------- \n\n')
                jscontents = open(jspath, 'r').readlines()
                f.write(''.join(jscontents))
            else:
                print( jspath + " not found." );
    f.close()
    
    print( "hotjsbin updated." )
    
def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [command] [options]
Commands:
    init            Check lime dependecies and setup if needed
    create [path/name]   Setup new project [name]
    build [name]    Compile project to single Javascript file"""
    parser = optparse.OptionParser(usage)
    
    parser.add_option("-o", "--output", dest="output", action="store", type="string",
                      help="Output file for build result")
    
    (options, args) = parser.parse_args()
    
    if not (len(args) == 2 or (len(args)==1 and ['init','update'].count(args[0])==1 )) :
        parser.error('incorrect number of arguments')
        
    print( "welcome to hotjs." )
    
    if args[0]=='init' or args[0]=='update':
        update()
    
    elif args[0]=='create':
        create(args[1])
        
    else:
        logging.error('No such command: %s',args[0])
        exit(1)
    
if __name__ == '__main__':
    main()
        
    