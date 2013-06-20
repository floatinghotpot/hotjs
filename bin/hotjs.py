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

lib_dir = os.path.join(basedir, 'prj/lib')
hotjsbin_path = os.path.join(lib_dir,'hotjs-bin.js')

prj_basedir = os.path.join(basedir, 'prj')
tmpl_dir = os.path.join(prj_basedir, 'template')

apps_dir = os.path.join(prj_basedir, 'app')
games_dir = os.path.join(prj_basedir, 'game')
sns_dir = os.path.join(prj_basedir, 'sns')

project_records = os.path.join(prj_basedir,'projects')

def removeDupes(seq):
    # Not order preserving
    keys = {}
    for e in seq:
        keys[e.rstrip()] = 1
    return keys.keys()
    
def updateProjectRecord(add):
    lines = open(project_records,'r').readlines()
    if len(add):
        lines.append(add)
    newlines = filter(lambda x: exists(join(prj_basedir,x.rstrip())) and len(x.rstrip()),lines)
    newlines = removeDupes(newlines)
    
    f = open(project_records,'w')
    f.write('\n'.join(newlines))
    f.write('\n')
    f.close()
    
def escapeSpace(s):
    return s.replace(" ","\\ ")
    
def quoteSpace(s):
    return s.replace(" ","' '")

def create(type, name):
    if( type == 'app'):
        type_dir = apps_dir
    elif( type == 'game'):
        type_dir = games_dir
    else:
        return
    
    prj_path = os.path.join( type_dir, name )
    sns_path = os.path.join( sns_dir, name )
    
    if not exists(tmpl_dir):
        logging.error('Project template not found: %s\n', tmpl_dir)
        sys.exit(1)
    
    if exists(prj_path):
        print('Folder exists (%s), skip change.' % prj_path)
    else:
        shutil.copytree( os.path.join(tmpl_dir, type), prj_path )
        for fname in os.listdir(prj_path):
            fpath = os.path.join(prj_path, fname)
            if os.path.isfile( fpath ):
                newname = fname.replace('__name__', name)
                newpath = os.path.join(prj_path,newname)
                if fname.find("__name__")!=-1:
                    os.rename(fpath, newpath)
                for line in fileinput.FileInput( newpath, inplace=1):
                    line = line.replace('{__name__}',name)
                    print(line.rstrip())

    if exists(sns_path):
        print('Folder exists (%s), skip change.' % sns_path)
    else:
        shutil.copytree( os.path.join(tmpl_dir,'sns'), sns_path )
        for fname in os.listdir(sns_path):
            fpath = os.path.join(sns_path, fname)
            if os.path.isfile( fpath ):
                newname = fname.replace('__name__', name)
                newpath = os.path.join(sns_path,newname)
                if fname.find("__name__")!=-1:
                    os.rename(fpath, newpath)
                for line in fileinput.FileInput( newpath, inplace=1):
                    line = line.replace('{__name__}',name)
                    print(line.rstrip())

    print ('Project created: %s' % name)
    
    proj = os.path.relpath(prj_path, prj_basedir)
    if proj != '.':
        updateProjectRecord( proj )
        print('Project records updated.\n')

def build(name,options):
    pass

def update():
    hotjs_path = join(basedir,'hotjs/')
    hotjslist_path = join(hotjs_path,'files')
 
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
    
    print( "\nDone. hotjsbin updated: %s.\n" % hotjsbin_path )
    
def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [command] [options]
Commands:
    init          Check lime dependecies and setup if needed
    update        Update hotjs into single javascript file for release
    create [app/game] [name]   Setup new project [name]"""
    
    parser = optparse.OptionParser(usage)
    parser.add_option("-o", "--output", dest="output", action="store", type="string",
                      help="Output file for build result")
    
    (options, args) = parser.parse_args()
    
    if( len(args) < 1 ) :
        parser.error('incorrect number of arguments\n')
        
    if args[0]=='init' or args[0]=='update':
        update()
    
    elif args[0]=='create':
        if( len(args) == 3 and ['app','game'].count(args[1]) == 1 ) :
            create(args[1], args[2])
        else:
            parser.error('arguments for create not correct.\n')
        
    else:
        logging.error('No such command: %s\n',args[0])
        exit(1)
    
if __name__ == '__main__':
    main()
        
    