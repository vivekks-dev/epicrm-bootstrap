#!/bin/bash

set -e
set -o nounset

if [ -z "${1-}" ] || [ -z "${2-}" ]; then
	>&2 echo "USAGE: $0 PROJDIR PROJNAME"
	exit 1
fi

PROJDIR="$1"
PROJNAME="$2"
scriptdir="$(dirname "$0")"

for f in "$scriptdir"/docker-compose*.yml; do
	echo "Copy $f..."
	
	targfile="$PROJDIR/$(basename "$f")"
	
	echo '# DO NOT EDIT' > "$targfile"
	cat "$f" >> "$targfile"

	# TODO accept repo as cmdln arg
	#sed -i 's/ image: epicrm_/ image: 853494791452.dkr.ecr.us-east-1.amazonaws.com\/epixel-retyn\/epicrm_/g' "$targfile"
done
