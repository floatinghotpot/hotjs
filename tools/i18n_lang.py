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

words = {}
dicts = { 'en':{}, 'zh':{}, 'ja':{} }

def scan_words( path ):
    if(not path.endswith('.js')): return
    
    fh = open( path, 'r' )
    txt = fh.read()
    fh.close()
    
    p = re.compile(r"_T\(\s*['\"](\w*)['\"]\s*\)")
    w = p.findall(txt)
    for k in w:
        if( len(k) == 0 ): continue
        words[ k ] = 1
        
    p = re.compile(r"\s*i18n=['\"](\w*)['\"]\s*")
    w = p.findall(txt)
    for k in w:
        words[ k ] = 1

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

def import_dict( lang, f ):
    dict = dicts[ lang ]
    str1 = 'hotjs.i18n.put(\'' + lang + '\', {'
    str2 = '});'
    
    fh = open( f, 'r' )
    txt = fh.read()
    fh.close()
    
    lines = txt.replace(str1, '').replace(str2, '').split('\n')
    p = re.compile(r"^'(\w*)'\s*:\s*(.*)$")
    dict = {}
    for line in lines:
        line = re.sub(r'(,$)', '', line.strip()).strip()
        if( len(line) == 0 ): continue
        
        #print( line )
        kv = p.findall( line )
        k = kv[0][0]
        v = kv[0][1]
        v = re.sub(r"(^['\"])|(['\"]$)", '', v.strip())
        #print( k + ': ' + v )
        dict[ k ] = v
        
        if(lang == 'zh'): 
            words[k] = 1
        
    #print( dict )
    dicts[ lang ] = dict
    pass

def import_dict_files( dir ):
    for k in dicts.keys():
        f = dir + '/' + k + '.lang.js'
        print( 'importing from: %s' % f )
        import_dict( k, f )
    pass

def export_dict( lang, f ):
    dict = dicts[ lang ]
    #print( dict )
    
    str1 = 'hotjs.i18n.put(\'' + lang + '\', {\n'
    str2 = '\n});\n'
    
    fh = open( f, 'w' ) 
    fh.write( str1 )

    w = sorted( words.keys() )
    #print( w )
    #print( '\n' )
    newdict = []    
    for k in w:
        if( len(k) == 0 ): continue
        if( dict.has_key(k)):
            v = dict[k]
        else:
            v = ''
        newdict.append( "\t'" + k + "' : " + "'" + v + "'" )
    
    fh.write( ",\n".join(newdict) ) 
    fh.write( str2 )
    fh.close()  
    pass

def export_dict_files( dir ):
    for k in dicts.keys():
        f = dir + '/gen-' + k + '.lang.js'
        print( 'exporting to: %s' % f )
        export_dict( k, f )

def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog [js file or dir to scan] -i [import lang dir] -o [export lang dir]
    
    example:
           %prog ./game.js
           %prog ./game.js -i ./lang -o ./lang
    """
    
    parser = optparse.OptionParser(usage)
    parser.add_option("-i", "--input", dest="inputpath", help="input lang folder")
    parser.add_option("-o", "--output", dest="outputpath", help="output lang folder")
    
    (options, args) = parser.parse_args()
    
    if( len(args) < 1 ) :
        parser.error('lacking arguments, please give source file path to scan.\n')
        exit(1)
    
    if( isinstance(options.inputpath, str) ):
        import_dict_files( options.inputpath )
    
    for f in args:
        print( 'scanning: %s' % f )
        scan_words( f )
    
    print( 'Totally %d words to be localized.\n' % len(words) )
    print( sorted(words.keys()) )
    print( '' )

    if( isinstance(options.outputpath, str) ):
        export_dict_files( options.outputpath )
    
    print( '\nDone.\n')

if __name__ == '__main__':
    main()
        
    