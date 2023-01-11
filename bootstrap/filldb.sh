#!/bin/bash

set -e
set -o nounset

usage() {
	>&2 echo USAGE: "$0" -srcdir SRCDIR [-sqlsuffix SQLSUFFIX] -f COMPOSEFILE1 [-f COMPOSEFILE2 ...] [MODULE1 [MODULE2 ...]]
}

conerr() {
	>&2 echo 'Connection error.'
	exit 1
}

loadsql() {
	db="$1"
	testtab="$2"
	file="$3"
	MAXTRY='1111111111'

	try=''; while [ "$try" != "$MAXTRY" ]; do try=1"$try"; echo "$db: Try $try"; sleep 1; if [ "$(docker compose -p "$EPICRM_PROJECT_NAME" "${composefiles[@]}" exec -T "$db" psql -U postgres -c "SELECT COUNT(*) FROM $testtab;" > /dev/null; echo "$?")" = "0" ]; then break; fi; done
	
	if [ "$try" = "$MAXTRY" ]; then
		conerr
	fi
	
	echo "Load $file"
	cat "$file"|docker compose -p "$EPICRM_PROJECT_NAME" "${composefiles[@]}" exec -T "$db" psql -U postgres || conerr
}


sqlsuffix=''
srcdir=''

declare -a composefiles

go_on=1

while [ "$go_on" ]; do
	case "$1" in
	'-sqlsuffix')
		if [ -n "$sqlsuffix" ]; then
			>&2 echo 'error: sqlsuffix can be set only once.'
			exit 1
		fi
		
		shift
		if [ -z "${1-}" ]; then usage; exit 1; fi
		sqlsuffix="$1"
		shift
	;;
	'-srcdir')
		if [ -n "$srcdir" ]; then
			>&2 echo 'error: srcdir can be set only once.'
			exit 1
		fi
		
		shift
		if [ -z "${1-}" ]; then usage; exit 1; fi
		srcdir="$1"
		shift
	;;
	'-f')
		shift
		if [ -z "${1-}" ]; then usage; exit 1; fi
		composefiles+=(-f "$1")
		shift
	;;
	*)
		go_on=''
	esac
done

if [ -z "$srcdir" ]; then
	usage
	exit 1
fi

declare -a userdbs

while [ "${1-}" ]; do
	if [ "$(echo "${1-}"|grep '^-')" ]; then usage; exit 1; fi

	userdbs+=("$1")
	shift
done

if [ -z "${EPICRM_PROJECT_NAME-}" ]; then
	>&2 echo 'env var EPICRM_PROJECT_NAME is not set.'
	exit 1
fi

dblist=(authdb orgdb)
dblist+=("${userdbs[@]}")

for db in "${dblist[@]}"; do
	for suffix in '-common' "$sqlsuffix"; do
		if [ -z suffix ]; then
			continue
		fi
	
		file="$srcdir/$db$suffix".sql

		if [ -f "$file" ]; then
			loadsql "$db" dbmeta "$file"
		else
			>&2 echo 'Skipping because not found: '"$file"
		fi
	done
done
