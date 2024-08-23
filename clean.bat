@echo off

setlocal enabledelayedexpansion

rem Emscripten SDK...

set EMSCRIPTENDIR=c:/emscripten/emsdk
set BUILDDIR=build

if exist %BUILDDIR% (
    @rmdir /S /Q %BUILDDIR%
)

cd src
set DIR=%cd%
@call cmd /C "%EMSCRIPTENDIR:~0,2% && cd %EMSCRIPTENDIR% && emsdk_env.bat && %DIR:~0,2% && cd %DIR% && automake.bat clean"
cd ..

if exist examples\src\free-queue (
    @rmdir /S /Q examples\src\free-queue
)

cd examples

if exist node_modules (
    @rmdir /S /Q node_modules
)

if exist dist (
    @rmdir /S /Q dist
)

cd ..

@echo Whole project is clean...
