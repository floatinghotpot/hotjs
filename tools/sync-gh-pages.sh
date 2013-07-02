#!/bin/sh

echo "sync to gh-pages ..."

git checkout gh-pages
git merge master
git push origin gh-page
git checkout master

echo "done."

