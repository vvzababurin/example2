#!/bin/sh
#-s ENVIRONMENT=worker \
emcc  ./free_queue.c 	-o free_queue.mjs\
  -s ENVIRONMENT=worker \
	-s MODULARIZE=1 \
	-s EXPORT_NAME=FQC \
  -s EXPORT_ES6=1 \
	-s INVOKE_RUN=0 \
	-s SINGLE_FILE=1 \
	-s USE_ES6_IMPORT_META=1 \
	-s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" \
	-pthread