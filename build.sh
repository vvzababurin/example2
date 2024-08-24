#!/bin/sh

# Emscripten SDK...
# export EMSCRIPTENDIR=c:/emscripten/emsdk

# export CC=emcc
# export EMCCFLAGS="-s MODULARIZE=1 -s EXPORT_ES6=1 -s SINGLE_FILE=0 -s TOTAL_MEMORY=200MB -s ALLOW_MEMORY_GROWTH=0 -s EXPORTED_RUNTIME_METHODS=['callMain','ccall','cwrap'] -s INVOKE_RUN=0 -O3"

export BUILDDIR=build

if [ ! -d $BUILDDIR ]; then
    mkdir -p ./$BUILDDIR
else
    rm -f ./$BUILDIR/*.*
fi

cd src
export DIR=`pwd`
sh ./build.sh
cd ..

if [ ! -d examples/src/free-queue ]; then 
    mkdir examples/src/free-queue
fi

# cp ./build/*.* examples/src/js
cp ./$BUILDDIR/*.* examples/src/free-queue

cd examples

if [ ! -d node_modules ]; then
    npm install
fi

npm run build:webpack
npm run start:webpack

cd ..