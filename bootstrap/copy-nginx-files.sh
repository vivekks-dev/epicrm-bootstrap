#!/bin/bash

set -e
set -o nounset

if [ -z "${1-}" ]; then
	>&2 echo "USAGE: $0 PROJDIR"
	exit 1
fi

PROJDIR="$1"
scriptdir="$(dirname "$0")"
targdir="$PROJDIR/autogen/gatewayconf"

mkdir -p "$targdir"

for i in 'apigate.conf' 'api-json-errors.conf' 'nginx.conf'; do
	for f in "$scriptdir"/nginxconf/"$i"; do
		echo "Copy $f..."

		targfile="$targdir/$i"

		echo '# DO NOT EDIT' > "$targfile"
		cat "$f" >> "$targfile"
	done
done
