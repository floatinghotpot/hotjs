#!/bin/sh

UNAME=`uname`
if [ "$UNAME" == "Darwin" ]; then
  PYTHON="/opt/local/bin/python2.6"
else
  PYTHON="/usr/bin/python"
fi

if [ ! -f ${PYTHON} ]; then
  echo "${PYTHON} not found. Please install python first."
fi

#
# Install setuptools first
#

wget https://bitbucket.org/pypa/setuptools/raw/0.7.2/ez_setup.py
sudo ${PYTHON} ez_setup.py

#
# Install python-memcached now
#

wget ftp://ftp.tummy.com/pub/python-memcached/python-memcached-latest.tar.gz
tar xvf python-memcached-latest.tar.gz
cd python-memcached-1.*
${PYTHON} setup.py build
sudo ${PYTHON} setup.py install
cd ..
rm -rf python-memcached-1.*

