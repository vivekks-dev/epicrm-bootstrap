#!/bin/bash

set -e
set -o nounset

passgen() {
	head -c 32 /dev/urandom|base64 -w 0|sed 's/[^a-zA-Z0-9]/x/g'
}

if [ -z "${1-}" ] || [ -z "${2-}" ]; then
	>&2 echo "USAGE: $0 PROJDIR PROJNAME [ DB1NAME DB2NAME ... ]"
	exit 1
fi

PROJDIR="$1"
shift
PROJNAME="$1"
shift

declare -a dblist

while [ "${1-}" ]; do
	if [ "$(echo "${1-}"|grep '^-')" ]; then usage; exit 1; fi

	dblist+=("$1")
	shift
done

envdir="$PROJDIR/env"
secdir="$PROJDIR/env-secret"

mkdir -p "$envdir"
mkdir -p "$secdir"

echo 'EPICRM_APISERV=http://epicrm-apigate:80' > "$envdir"/apiserv.env

# --- BEGIN DB secret for others, secret for self, secret for migration --------

for db in "${dblist[@]}"; do
	dbucase="$(echo "$db"|awk '{print(toupper($0))}')"
	if [ ! -f "$secdir"/"$db".secret.env ]; then
		echo "$dbucase"'_POSTGRES_PASSWORD='"$(passgen)" > "$secdir"/"$db".secret.env; 
		if [ "$db" == "globalenergydb" ]; then
			echo 'GLOBALENERGYDJANGODB_POSTGRES_PASSWORD=postgres' >> "$secdir"/"$db".secret.env; 
		fi
	fi

	if [ ! -f "$secdir"/"$db".self.secret.env ]; then
		grep "^$dbucase"'_POSTGRES_PASSWORD=' "$secdir"/"$db".secret.env | sed "s/^$dbucase"'_POSTGRES_PASSWORD=/POSTGRES_PASSWORD=/' >> "$secdir"/"$db".self.secret.env;
	fi

	if [ ! -f "$secdir"/"$db"-migrate.self.secret.env ]; then
		pgpass="$(grep "^$dbucase"'_POSTGRES_PASSWORD=' "$secdir"/"$db".secret.env | sed -E "s/^$dbucase"'_POSTGRES_PASSWORD=(.*)$/\1/')"
		# Python code copied from https://github.com/golang-migrate/migrate#readme
		pgpassq="$(echo "$pgpass"|python3 -c 'import urllib.parse; print(urllib.parse.quote(input(""), ""))')"
		echo "DBURL=postgres://postgres:$pgpassq@$db?sslmode=disable" > "$secdir"/"$db"-migrate.self.secret.env
	fi
done

# --- END DB secret for others, secret for self, secret for migration ----------

if [ ! -f "$secdir"/apitokdb.secret.env ]; then
	echo "REDIS_PASSWORD=$(passgen)" > "$secdir"/apitokdb.secret.env; 
fi

if [ ! -f "$secdir"/authdb-replicator.secret.env ]; then
	echo "PGPOOL_SR_CHECK_PASSWORD=$(passgen)" > "$secdir"/authdb-replicator.secret.env; 
fi

if [ ! -f "$secdir"/authpgpool.secret.env ]; then
	echo "PGPOOL_ADMIN_PASSWORD=$(passgen)" > "$secdir"/authpgpool.secret.env; 
fi

if [ ! -f "$secdir"/authpgpool-pgpass.secret.env ]; then
	echo '# Must match AUTHDB_POSTGRES_PASSWORD from authpgpool.secret.env' > "$secdir"/authpgpool-pgpass.secret.env;
	grep '^AUTHDB_POSTGRES_PASSWORD=' "$secdir"/authdb.secret.env | sed 's/^AUTHDB_POSTGRES_PASSWORD=/PGPOOL_POSTGRES_PASSWORD=/' >> "$secdir"/authpgpool-pgpass.secret.env; 
fi

if [ ! -f "$secdir"/websessdb.secret.env ]; then
	echo "REDIS_PASSWORD=$(passgen)" > "$secdir"/websessdb.secret.env; 
fi
