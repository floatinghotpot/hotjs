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
import subprocess

if sys.version_info[0]==3:
    from urllib.request import urlretrieve
else :
    from urllib import urlretrieve

tooldir = os.path.dirname(os.path.realpath(__file__))
devdir = os.path.dirname(tooldir)
basedir = os.path.dirname(devdir)
curdir = os.path.abspath('.')

lib_dir = os.path.join(devdir, 'hotjs/lib')
hotjsbin_path = os.path.join(lib_dir,'hotjs-src.js')
hotjsmini_path = os.path.join(lib_dir,'hotjs.min.js')

def removeDupes(seq):
    # Not order preserving
    keys = {}
    for e in seq:
        keys[e.rstrip()] = 1
    return keys.keys()
    
def escapeSpace(s):
    return s.replace(" ","\\ ")
    
def quoteSpace(s):
    return s.replace(" ","' '")

def find_yuicompressor():
    for root, subFolders, files in os.walk(tooldir):
        for file in files:
            if( file.startswith('yuicompressor') ):
                return tooldir + '/' + file
    return ""
        
def build():
    hotjs_path = join(devdir,'hotjs/')
    hotjslist_path = join(hotjs_path,'files')
 
    print( "\nupdating hotjsbin: " + hotjsbin_path + '\n' )
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
    
    print( "\nhotjsbin updated: %s.\n" % hotjsbin_path )
    
    yui = find_yuicompressor()
    if( yui == '' ):
        print( 'YUI compressor not found in tools folder.' )
        return 0
    
    print( "minifying with YUICompressor ...");
    subprocess.call(['java', '-jar', yui, hotjsbin_path, '-o', hotjsmini_path ])

    print( "hotjsbin compressed to: %s.\n" % hotjsmini_path )
    print( 'Done.\n')

def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [command] [options]
Commands:
    init         Check lime dependecies and setup if needed
    build        Update hotjs into single javascript file and minify for release
    """
    
    parser = optparse.OptionParser(usage)
    parser.add_option("-o", "--output", dest="output", action="store", type="string",
                      help="Output file for build result")
    
    (options, args) = parser.parse_args()
    
    if( len(args) < 1 ) :
        parser.error('incorrect number of arguments\n')
        
    if args[0]=='build':
        build()
    
    else:
        logging.error('No such command: %s\n',args[0])
        exit(1)
    
if __name__ == '__main__':
    main()
        
    