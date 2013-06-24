#!/usr/bin/env python

"""Utility to convert .sprite to .js data format
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
import glob

if sys.version_info[0]==3:
    from urllib.request import urlretrieve
else :
    from urllib import urlretrieve

def convert(spritefile):
    if not exists(spritefile):
        print('file not found: %s' % spritefile)
        return 0
            
    fin = open(spritefile, 'r')
    txt = fin.read()
    txt = re.sub(r'(/\*.*\*/)', '', txt)
    lines = txt.split('\n')
    
    version = ''
    images = []
    modules = []
    frames = []
    anims = []
    
    status = 'begin'
    for line in lines:
        line = re.sub(r'(//.*$)', '', line).strip()
        if len(line) > 0:
            #print( line )
            #print status
            if status == 'begin':
                if line == '{':
                    status = 'root'
            elif status == 'root':
                w = line.split()
                if w[0] == 'VERSION':
                    version = int( w[1] )
                elif w[0] == 'IMAGE':
                    img_id = int(w[1], 16)
                    img = (img_id, w[2].replace('"','').replace('\\',r'/'), w[4] )
                    str = '%d:[\'%s\',\'%s\']' % img
                    images.append( str )
                elif w[0] == 'MODULES':
                    status = 'MODULES'
                elif w[0] == 'FRAME':
                    status = 'FRAME'
                elif w[0] == 'ANIM':
                    status = 'ANIM'
                elif w[0] == 'SPRITE_END':
                    status = 'SPRITE_END'
                elif w[0] == '}':
                    status = 'close'
                else:
                    pass
            elif status == 'MODULES':
                if line == '{':
                    modules = []
                    pass
                elif line == '}':
                    status = 'root'
                else:
                    w = line.split()
                    if w[0] == 'MD':
                        mod_id = int( w[1], 16 )
                        if w[2] == 'MD_IMAGE':
                            mod = ( mod_id, w[2], int(w[3]), int(w[4]), int(w[5]), int(w[6]), int(w[7]) )
                            str = '%d:[\'%s\',%d,%d,%d,%d,%d]' % mod
                        else:
                            mod = ( mod_id, w[2], w[3], int(w[4]), int(w[5]) )
                            str = '%d:[\'%s\',\'%s\',%d,%d]' % mod
                        modules.append( str )
            elif status == 'FRAME':
                if line == '{':
                    frame = []
                elif line == '}':
                    str = ('%d: [\n' % frame_id) + (',\n'.join(frame)) + '\n]';
                    frames.append( str )
                    status = 'root'
                else:
                    w = line.split()
                    if w[0] == 'FM':
                        if( len(w) > 4 ):
                            fm = ( int(w[1], 16), int(w[2]), int(w[3]), w[4] )
                            str = '[%d,%d,%d,\'%s\']' % fm
                        else:
                            fm = ( int(w[1], 16), int(w[2]), int(w[3]) )
                            str = '[%d,%d,%d]' % fm
                        frame.append( str )
                    else: 
                        frame_id = int( w[0], 16 )
                        
            elif status == 'ANIM':
                if line == '{':
                    anim = []
                elif line == '}':
                    str = ('%d: [\n' % anim_id) + (',\n'.join(anim)) + '\n]';
                    anims.append( str )
                    status = 'root'
                else:
                    w = line.split()
                    if w[0] == 'AF':
                        
                        af = [  ]
                        if len(w) > 5:
                            af = (int(w[1], 16), int(w[2]), int(w[3]), int(w[4]), w[5])
                            str = '[%d,%d,%d,%d,\'%s\']' % af
                        else:
                            af = (int(w[1], 16), int(w[2]), int(w[3]), int(w[4]))
                            str = '[%d,%d,%d,%d]' % af
                        anim.append( str )
                    else: 
                        anim_id = int( w[0], 16 )

            else:
                pass

    # now output
    outfile = spritefile + '.js'
    fout = open(outfile, 'w')
    
    fout.write('\n// converted by sprite2js.py v0.1 (HotJS v1.0)\n')
    fout.write( '\nvar sprites = sprites || {};\n')
    head, tail = os.path.split(spritefile)
    fout.write( '\nsprites[\'%s\'] = {\n' % tail )
    
    fout.write( '\'version\' : %d,\n' % version )
    
    fout.write( '// images:\t%d\n' % len(images) )
    fout.write( '// modules:\t%d\n' % len(modules) )
    fout.write( '// frames:\t%d\n' % len(frames) )
    fout.write( '// anims:\t%d\n' % len(anims) )

    fout.write( '\'images\' : {\n' );
    fout.write( ',\n'.join(images) )
    fout.write( '\n},\n' );
    
    fout.write( '\'modules\' : {\n' );
    fout.write( ',\n'.join(modules) )
    fout.write( '\n},\n' );

    fout.write( '\'frames\' : {\n' );
    fout.write( ',\n'.join(frames) )
    fout.write( '\n},\n' );

    fout.write( '\'anims\' : {\n' );
    fout.write( ',\n'.join(anims) )
    fout.write( '\n}\n' );
    
    fout.write( '};\n\n')
    fout.close()
    
    print('%s: version: %d, images: %d, modules: %d, frames: %d, anims: %d, done.' % (spritefile, version, len(images), len(modules), len(frames), len(anims)) )
    return 1

def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog spritefile | *.sprite
"""
    
    parser = optparse.OptionParser(usage)
    (options, args) = parser.parse_args()
    
    if( len(args) < 1 ) :
        parser.error('incorrect number of arguments\n')

    #files = glob.glob( args[0] )
    n = 0;
    for f in args:
        n = n + convert( f )
    print( '%d file converted.\n' % n )
    
if __name__ == '__main__':
    main()
        
    