#!/usr/bin/env python

"""Utility to convert .pst to .js data format
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
import xml.etree.ElementTree as et

if sys.version_info[0]==3:
    from urllib.request import urlretrieve
else :
    from urllib import urlretrieve

def get_v( attr ):
    v = []
    i = 0;
    while( ("v_%d" % i) in attr ):
        v.append( attr[ ("v_%d" % i) ] )
        i = i +1
    return v
    
def convert(pstfile):
    if exists(pstfile):
        print( 'processing %s ... ' % pstfile )
    else:
        print('file not found: %s' % pstfile )
        return 0
            
    fin = open(pstfile, 'r')
    txt = fin.read()
    
    #parse XML
    PtsSystem = et.fromstring( txt )
    LauncherGroup = PtsSystem[0]

    launchers = []
    for L in LauncherGroup:
        
        launcher = []
            
        attr = L.attrib
        for k in attr:
            v = attr[k]
            if( k == 'name' ):
                launcher.append( '%s:\'%s\'' % (k, v) )
            elif( k == 'res' ):
                if( v.endswith('.sprite') ):
                    v = v + '.js'
                launcher.append( '%s:\'%s\'' % (k, v) )
            else:
                launcher.append( '%s:%s' % (k, v) )
        
        for L1 in L:
             
            if( L1.tag == 'mode' ):
                attr = L1.attrib
                launcher.append( 'mode:{id:%s,v:[%s]}' % (attr['id'], ','.join( get_v(attr) )) )

            elif( L1.tag == 'FilterGroup' ):
                filters = []
                for filter in L1:
                    tg = filter.tag
                    attr = filter.attrib
                    
                    if( tg == 'ColorTransformFilter' ):
                        tg = 'color'
                    elif( tg == 'OrientationTransformFilter'):
                        tg = 'rotate'
                    elif( tg == 'SizeTransformFilter'):
                        tg = 'scale'
                    elif( tg == 'ShotTransformFilter'):
                        tg = 'move'
                    elif( tg == 'H3GColorEffectsAction'):
                        tg = 'h3g'
                    else:
                        pass
            
                    if( 'id' in attr ):
                        id = attr['id']
                    else:
                        id = 0
                        
                    if( 'size' in attr ):
                        size = attr['size']
                    else:
                        size = 0
                    
                    filters.append( '{type:\'%s\',id:%s,size:%s,v:[%s]}' % (tg, id, size, ','.join(get_v(attr))) )
                    
                launcher.append( 'filters:[\n%s\n]' % (',\n'.join(filters)) )
        
            elif( L1.tag == 'path' ):
                path = []
                attr = L1.attrib 
                for k in attr:
                    path.append( '%s:%s' % (k, attr[k]) )
                    
                for L2 in L1:
                    if( L2.tag == 'PathPoints'):
                        attr = L2[0].attrib
                        point = []
                        for k in attr:
                            point.append( '%s:%s' % (k, attr[k]) )
                        path.append( 'point:{%s}' % (','.join(point)))
                            
                    elif( L2.tag == 'curver' ):
                        path.append( 'curver:[%s]' % (','.join(get_v(L2.attrib))))
                        
                    else:
                        pass
                    
                launcher.append( 'path:{\n%s\n}' % (',\n'.join(path)) )

        launchers.append('{\n%s\n}' % (',\n'.join(launcher)))

    #write to js
    
     # now output
    outfile = pstfile + '.js'
    fout = open(outfile, 'w')
    
    fout.write('\n// converted by pst2js.py v0.1 (HotJS v1.0)\n')
    fout.write( '\nvar pst_cache = pst_cache || {};\n')
    head, tail = os.path.split( outfile )
    txt = ( '\npst_cache[\'%s\'] = {\n' % tail )

    attr = PtsSystem.attrib
    for k in attr:
        if( k == 'scale' ):
            txt = txt + ( 'scale:%s,\n' % attr[k] );
        else:
            txt = txt + ( 'back:\'%s\',\n' % attr[k] );
    
    txt = txt + ( 'launchers:[\n%s] };\n\n' % (',\n'.join(launchers)) )
    
    fout.write( txt.replace('X:\\par\\particle\\', 'img/') )
    fout.close()
    
    print('%s: launchers: %d, done.' % (pstfile, len(launchers)) )
    return 1

def main():
    """The entrypoint for this script."""
    
    usage = """usage: %prog pstfile | *.sprite
"""
    
    parser = optparse.OptionParser(usage)
    (options, args) = parser.parse_args()
    
    if( len(args) < 1 ) :
        parser.error('incorrect number of arguments\n')

    #files = glob.glob( args[0] )
    n = 0;
    for f in args:
        n = n + convert( f )
    print( '%d file(s) converted.\n' % n )
    
if __name__ == '__main__':
    main()
        
    
