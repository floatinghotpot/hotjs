#!/bin/sh

pz=`which phpize`
if [ "x$pz" == "x" ]; then
echo "phpize not found. It seems that php not installed. Abort."
exit 0
fi

mkdir tmp
cd tmp

# Install autoconfig if not found
acfg=`which autoconf`
if [ "x$acfg" == "x" ]; then
echo "autoconf not found. Now installing ..."
wget http://ftp.gnu.org/gnu/autoconf/autoconf-2.69.tar.gz
tar xzf autoconf-2.69.tar.gz
cd autoconf-2.69
./configure --prefix=/usr/local
make
sudo make install
cd ..
echo "autoconf installed."
fi

#
# Install libmemcached
#
wget https://launchpad.net/libmemcached/1.0/1.0.17/+download/libmemcached-1.0.17.tar.gz
tar xvf libmemcached-1.0.17.tar.gz
./configure
make
sudo make install
cd ..

#
# Bulid & install PHP mod_memcached
#
wget http://pecl.php.net/get/memcached-2.1.0.tgz
tar xvf memcached-2.1.0.tgz
cd memcached-2.1.0
phpize
./configure
make
make test
sudo make install
cd ..

#
# Build & install PHP mod_memcache
#
echo "Download and install memcache now ..."
wget http://pecl.php.net/get/memcache-2.2.7.tgz
tar -xvzf memcache-2.2.7.tgz
cd memcache-2.2.7
phpize
./configure --enable-memcache
make
sudo make install
cd ..
echo "memcache for php installed."

cd ..
echo "done."

# If using MAMP
# cp modules/memcache.so /Applications/MAMP/bin/php/php5.3.6/lib/php/extensions/no-debug-non-zts-20090626/
# emacs /Applications/MAMP/bin/php/php5.3.6/conf/php.ini 
# add line: extension=memcache.so
 
# If using Apache2
# sudo emacs /etc/php.ini 
# add line: extension=memcache.so
