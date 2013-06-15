#!/bin/sh

#!/bin/sh

#
# using MacPorts to install it
# 

pts=`which port`
if [ "x$pts" == "x" ]; then
  echo "port not found. Seems MacPorts not installed. Abort."
  exit 0
fi

sudo port install mod_python26

#
# add following content to apache config file
#
# LoadModule python_module modules/mod_python.so
#
#<IfModule mod_python.c>
# AddHandler mod_python .py
# PythonHandler mod_python.publisher
# PythonDebug On
#</IfModule>
#
# then restart apache
# sudo /opt/local/apache2/bin/apachectl restart
#
