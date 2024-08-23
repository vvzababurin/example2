#!/bin/sh

# Emscripten SDK...
# export EMSCRIPTENDIR=c:/emscripten/emsdk

export CC=emcc
export EMCCFLAGS="-s MODULARIZE=1 -s EXPORT_ES6=1 -s SINGLE_FILE=0 -s TOTAL_MEMORY=200MB -s ALLOW_MEMORY_GROWTH=0 -s EXPORTED_RUNTIME_METHODS=['callMain','ccall','cwrap'] -s INVOKE_RUN=0 -O3"

export BUILDDIR=build

if -d $BUILDDIR ]; then
    rmdir -p ./$BUILDDIR
fi

cd src
export DIR=`pwd`
sh ./automake.sh clean
cd ..

if [ -d ./examples/src/free-queue ]; then 
    rmdir -p ./examples/src/free-queue
fi

cd examples

if [ -d ./node_modules ]; then
    rmdir -p ./node_modules
fi

if [ -d ./dist ]; then
    rmdir -p ./dist
fi

cd ..

echo Whole project is clean...