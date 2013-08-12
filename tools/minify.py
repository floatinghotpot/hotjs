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
hotjsbin_path = os.path.join(lib_dir,'hotjs-bin.js')
hotjsmini_path = os.path.join(lib_dir,'hotjs-mini.js')

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
        
def minify( inputfile ):
    yui = find_yuicompressor()
    if( yui == '' ):
        print( 'YUI compressor not found in tools folder.' )
        return 0
    
    if exists( inputfile ):
        #print( 'processing %s ... ' % inputfile )
        pass
    else:
        print('file not found: %s' % inputfile )
        return 0
    
    words = inputfile.split('.')
    words.insert( len(words)-1, 'min' )
    outputfile = '.' . join(words)
        
    print( "minifying '%s' to '%s' ... " % (inputfile, outputfile) )
    subprocess.call(['java', '-jar', yui, inputfile, '-o', outputfile ])

    print( 'Done.\n')

def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [js/css file]
    """
    
    parser = optparse.OptionParser(usage)
    parser.add_option("-o", "--output", dest="output", action="store", type="string",
                      help="Output file for minified result")
    
    (options, args) = parser.parse_args()
    
    if( len(args) < 1 ) :
        parser.error('lacking arguments, give js/css file path as input please.\n')
        exit(1)
        
    minify( args[0] )
    
if __name__ == '__main__':
    main()
        
    