#!/bin/sh

#
# install apache2 if not installed
#
ap=`which apache2`
if [ "x$ap" == "x" ]; then
sudo apt-get install apache2
fi

#
# install mod_python
#
sudo apt-get install libapache2-mod-python
sudo a2enmod python

#
# add following content to apache config file
#
# LoadModule python_module modules/mod_python.so
#
# AddHandler mod_python .py
# PythonHandler mod_python.publisher
# PythonDebug On
#
# then restart apache
#

#
# Note: 
# python engine cache .py files, may need restart apache if .py changed
#