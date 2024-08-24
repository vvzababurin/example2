@echo off

setlocal enabledelayedexpansion

rem Emscripten SDK...

set EMSCRIPTENDIR=c:/emscripten/emsdk
set BUILDDIR=build

rem set CC=emcc
rem set EMCCFLAGS=-s MODULARIZE=1 -s EXPORT_ES6=1 -s SINGLE_FILE=0 -s TOTAL_MEMORY=200MB -s ALLOW_MEMORY_GROWTH=0 -s EXPORTED_RUNTIME_METHODS=['callMain','ccall','cwrap'] -s INVOKE_RUN=0 -O3

if not exist %BUILDDIR% (
    @mkdir %BUILDDIR%
) else (
    @del build\*.* /F /Q
)

cd src
set DIR=%cd%
@call cmd /C "%EMSCRIPTENDIR:~0,2% && cd %EMSCRIPTENDIR% && emsdk_env.bat && %DIR:~0,2% && cd %DIR% && build.bat"
cd ..

if not exist examples\src\free-queue (
    mkdir examples\src\free-queue
)

rem @copy build\*.* examples\src\js /Y
@copy %BUILDDIR%\*.* examples\src\free-queue /Y

cd examples

if not exist node_modules (
    @call cmd /C "npm install"
)

@call cmd /C "npm run build:webpack"
@call cmd /C "npm run start:webpack"

cd ..

