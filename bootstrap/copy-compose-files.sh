#!/bin/bash

set -e
set -o nounset

if [ -z "${1-}" ] || [ -n "${3-}" ]; then
	>&2 echo "USAGE: $0 PROJDIR [IMAGEREPO]"
	exit 1
fi

PROJDIR="$1"

IMAGEREPO=''
ESCIMAGEREPO=''
if [ -n "${2-}" ]; then
	IMAGEREPO="$2"
	# Replace escape all backslash and then escape all slash
	ESCIMAGEREPO="$(echo "$IMAGEREPO"|sed 's/\\/\\\\/g'|sed 's/\//\\\//g')"
fi

scriptdir="$(dirname "$0")"

for f in "$scriptdir"/docker-compose*.yml; do
	echo "Copy $f..."
	
	targfile="$PROJDIR/$(basename "$f")"
	
	if [ -e "$targfile" ]; then
		echo 'Already exists; not copying.'
		continue
	fi
	
	echo '# DO NOT EDIT' > "$targfile"
	cat "$f" >> "$targfile"

	if [ -n "$ESCIMAGEREPO" ]; then
		sed -i "s/ image: epicrm_/ image: $ESCIMAGEREPO\/epicrm_/g" "$targfile"
	fi
done
