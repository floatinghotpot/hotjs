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
from os.path import join, splitext, split, exists, isfile, isdir, islink, ismount
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

def find_yuicompressor():
    for root, subFolders, files in os.walk(tooldir):
        for file in files:
            if( file.startswith('yuicompressor') ):
                return tooldir + '/' + file
    return ""
        
yui_jar = find_yuicompressor()

def minify( inputfile, options ):
    if( exists(inputfile) ):
        if( inputfile.endswith('.js') or inputfile.endswith('.css') ):
            words = inputfile.split('.')
            words.insert( len(words)-1, 'min' )
            outputfile = '.' . join(words)
            
            if options.clean:
                print( 'removing: %s' % outputfile );
                if exists( outputfile ):
                    os.remove( outputfile )
                
            if options.build:
                print( "minifying: %s" % inputfile )
                subprocess.call(['java', '-jar', yui_jar, inputfile, '-o', outputfile ])
                
            if options.replace:
                print( "replacing: %s" % inputfile )
                os.rename( outputfile, inputfile )
                
        else:
            #print( 'skip: ' + inputfile )
            pass
    else:
        print( 'not found: ' + inputfile )
        
def minify_recursive( path, options ):
    if os.path.isfile( path ):
        minify( path, options )
    elif os.path.islink( path ):
        pass
    elif os.path.isdir( path ):
        for root, subFolders, files in os.walk(path):
            for f in files:
                minify( root +  '/' + f, options )
            for dir in subFolders:
                if( dir == '.' or dir == '..') :
                    pass
                else:
                    minify_recursive( root + '/' + dir, options )
    else:
        print( 'file not found: ' + path )

def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [js/css file or dir]
    """
    
    if( yui_jar == '' ):
        print( 'YUI compressor not found in tools folder.' )
        return 0
    else:
        print( 'yui_jar: ' + yui_jar )

    parser = optparse.OptionParser(usage)
    parser.add_option("-c", "--clean", action="store_true", dest="clean", default=False, 
                      help="clean the minified output files")
    parser.add_option("-b", "--build", action="store_true", dest="build", default=True, 
                      help="build, compress js/css to minified files")
    parser.add_option("-r", "--replace", action="store_true", dest="replace", default=False, 
                      help="replace source files with compressed files")
    
    (options, args) = parser.parse_args()
    
    if options.replace: 
        options.build = True
        
    if options.clean:
        options.build = False
        options.replace = False
            
    if( len(args) < 1 ) :
        parser.error('lacking arguments, please give js/css file path as input.\n')
        exit(1)
    
    for arg in args:
        minify_recursive( arg, options )
    
    print( 'Done.\n')

if __name__ == '__main__':
    main()
        
    