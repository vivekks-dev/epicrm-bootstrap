#!/bin/bash

set -e
set -o nounset

if [ -z "${1-}" ] || [ -z "${2-}" ]; then
	>&2 echo "USAGE: $0 PROJDIR PROJNAME"
	exit 1
fi

PROJDIR="$1"
PROJNAME="$2"

# TODO rem /$PROJNAME suffix; but make sure to update docker compose file, etc.
envdir="$PROJDIR/env"
secdir="$PROJDIR/env-secret"

mkdir -p "$secdir"

if [ ! -e "$secdir"/apiclient.secret.env ]; then
	cat<<end>"$secdir"/apiclient.secret.env
EPICRM_CLIENT_ID=5d588566-457f-11ed-a92d-e3fdbfbbeaa1
EPICRM_CLIENT_SECRET=mayIAccess?
end
fi

echo 'EPICRM_SYSORG_UUID=41c5a4a8-656b-11ed-95c9-6ffe2af11337' > "$envdir/sysorguuid.env"
