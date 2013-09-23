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

srcdir = ''
langdir = ''

words = []
dicts = { 'en':{}, 'zh':{}, 'ja':{} }

def scan_words( path ):
    pass

def scan_words_recursive( path ):
    if os.path.isfile( path ):
        scan_words( path )
    elif os.path.islink( path ):
        pass
    elif os.path.isdir( path ):
        for root, subFolders, files in os.walk(path):
            for f in files:
                scan_words( root +  '/' + f )
    else:
        print( 'file not found: ' + path )

def import_dict( f ):
    pass

def export_dict( f ):
    pass

def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [js file or dir]
    """
    
    parser = optparse.OptionParser(usage)
    parser.add_option("-i", "--input", dest="inputpath", help="input lang folder")
    parser.add_option("-o", "--output", dest="outputpath", help="output lang folder")
    #parser.add_option("-s", "--scan", dest="scanpath", help="folder or file to scan words")
    
    (options, args) = parser.parse_args()
    
    if( len(args) < 1 ) :
        parser.error('lacking arguments, please give source file path to scan.\n')
        exit(1)
    
    import_dict( options.inputpath )
    
    scan_words_
    
    for arg in args:
        minify_recursive( arg, options )
    
    print( 'Done.\n')

if __name__ == '__main__':
    main()
        
    