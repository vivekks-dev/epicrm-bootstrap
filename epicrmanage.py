#!/usr/bin/env python3

# TODO saasman shouldn't be a special edition, but a customization/extension
# similar to that of any project built on epicrm.

import argparse
import json
import logging
import os
import subprocess
import sys

modprops = None

IMAGESREPO = '853494791452.dkr.ecr.us-east-1.amazonaws.com/epixel-retyn'
SCRIPTDIR = os.path.dirname(__file__)

def mypopen(args, env={}):
	logging.info('popen(): ' + ' '.join(args))
	popenObj = subprocess.Popen(args, env=env)
	if popenObj.wait() != 0:
		logging.error('subprocess failed: ' + ' '.join(args))
		sys.exit(1)

class Path:
	def __init__(self, pattern, needs_auth=True):
		self.pattern = pattern
		self.needs_auth = needs_auth
		self.exact = False
		self.invalid = False
		self.internal = False

class Module:
	def __init__(self, modname):
		self.name = modname
		self.paths = []
	
	def get_nginx_location_blocks(self):
		out = '# DO NOT EDIT\n\n'
	
		for path in self.paths:
			op = '= ' if path.exact else ''
			out += f'location {op}{path.pattern} {{\n'

			if path.invalid:
				out += f'\treturn 400;\n'
			else:
				if path.internal:
					out += f'\tinternal;\n'
				
				if path.needs_auth:
					out += '\n\tauth_request /auth/checkpoint;\n'
					out += '\tauth_request_set $epicrm_uid $upstream_http_x_epicrm_uid;\n'
					out += '\tproxy_set_header X-EPICRM-UID $epicrm_uid;\n'
				else:
					out += '\n\t# Clear to prevent header injection\n'
					out += '\tproxy_set_header X-EPICRM-UID "";\n'

				out += f'\n\tproxy_pass http://{self.name}api;\n'

			out += '}\n\n'
			
		return out

class ProjectConf:
	def __init__(self, projdir, projname):
		self.projdir  = projdir
		self.projname = projname
		self.testdb_sqlsuffix = None
		self.modules  = [ 'web' ]
		self.gatewayport = '8081'
		self.subnet = '172.31.0.0/16'
		self.local_images = False

	def copy_compose_files(self):
		args = [SCRIPTDIR + '/bootstrap/copy-compose-files.sh', self.projdir]
		if not self.local_images:
			args += [IMAGESREPO]

		mypopen(args)

	def docker_pull(self):
		mypopen(['docker', 'compose', '-p', self.projname] + self.get_compose_file_args() + ['pull'])
		
	def down(self):
		mypopen(['docker', 'compose', '-p', self.projname] + self.get_compose_file_args() + ['down'])

	def filldb(self, srcdir, sqlsuffix=None):
		args = ['-sqlsuffix', sqlsuffix] if sqlsuffix != None else []

		args += ['-srcdir', srcdir]

		args += self.get_compose_file_args()

		for mod in modprops:
			if mod['name'] not in self.modules:
				continue

			if 'api' not in mod or mod['api'] != True:
				continue

			args.append(mod['name'] + 'db')

		mypopen([SCRIPTDIR + '/bootstrap/filldb.sh'] + args, {'EPICRM_PROJECT_NAME': self.projname})

	def init_fix_missing(self):
		self.copy_compose_files()
		self.generate_gateway_conf()

	def initdb(self):
		self.filldb(SCRIPTDIR + '/bootstrap/initdb')

	def filltestdb(self, epicrm_srcdir):
		self.filldb(epicrm_srcdir + '/test/testdb', self.testdb_sqlsuffix)

	def included_modconfs(self):
		modconfs = []
		
		for mod in modprops:
			if 'api' not in mod or mod['api'] != True:
				continue
		
			if ('essential' in mod and mod['essential'] == True) or mod['name'] in self.modules:
				modconfs.append(mod)
		
		return modconfs

	def generate_gateway_conf(self):
		gwconfdir = self.projdir + '/autogen/gatewayconf'
		apiconfdir = gwconfdir + '/apiconf.d'
		newfiles = []

		mypopen([SCRIPTDIR + '/bootstrap/copy-nginx-files.sh', self.projdir])

		try:
			os.makedirs(apiconfdir)
		except FileExistsError:
			pass

		for mod in self.included_modconfs():
		
			modobj = Module(mod['name'])

			for path in mod['paths']:
				pathobj = Path(path['pattern'])

				if 'exact' in path:
					pathobj.exact = path['exact']

				if 'internal' in path:
					pathobj.internal = path['internal']

				if 'invalid' in path:
					pathobj.invalid = path['invalid']

				if 'needs_auth' in path:
					pathobj.needs_auth = path['needs_auth']
				
				modobj.paths.append(pathobj)

			outfnam = f'{mod["name"]}api.conf'
			outfpath = f'{apiconfdir}/{outfnam}'
			open(outfpath, 'w').write(modobj.get_nginx_location_blocks())
			newfiles.append(outfnam)

		# Delete files for no-longer-active modules	
		with os.scandir(apiconfdir) as it:
			for entry in it:
				if entry.is_file() and entry.name not in newfiles:
					logging.info('unlink: ' + entry.path)
					os.remove(entry.path)

		open(f'{gwconfdir}/apiback.conf', 'w').write(self.get_nginx_apiback_conf())

	def get_compose_file_args(self):
		cfarr = ['-f', f'{self.projdir}/docker-compose.yml']

		for m in self.modules:
			cfarr += ['-f', f'{self.projdir}/docker-compose.mod-{m}.yml']
		
		return cfarr

	def mkenv(self):
		mypopen([SCRIPTDIR + '/bootstrap/mkenv.sh', self.projdir, self.projname] +
			self.get_databases())

	def mktestenv(self):
		mypopen([SCRIPTDIR + '/bootstrap/mktestenv.sh', self.projdir, self.projname])

	def get_databases(self):
		dblist = []
	
		for modconf in self.included_modconfs():
			if 'databases' in modconf:
				dblist += modconf['databases']

		return dblist

	def get_dot_env(self):
		out = '# DO NOT EDIT\n\n'
		
		out += f'APIGATE_PORT={self.gatewayport}\n'
		out += f'SUBNET={self.subnet}\n'
		
		return out

	def get_nginx_apiback_conf(self):
		conf = '# DO NOT EDIT\n\n'
		
		conf += 'resolver 127.0.0.1 valid=5s;\n'
		
		for mod in self.included_modconfs():
			conf += f'\nupstream {mod["name"]}api {{\n'
			conf += f'\tzone {mod["name"]}api_service 64k;\n'
			conf += f'\tserver {mod["name"]}api:8080;\n'
			conf += '}\n'
		
		return conf

	def reload_gateway(self):
		# TODO rolling restart
		mypopen(['docker', 'compose', '-p', self.projname] + self.get_compose_file_args() + ['exec', 'apigate', 'sh', '-c', 'nginx -s reload'])

	def up(self):
		mypopen(['docker', 'compose', '-p', self.projname] + self.get_compose_file_args() + ['up', '-d'])
	
	def save(self):
		# TODO exclude self.projdir from serialization
		path = self.projdir + '/config.json'
		json.dump(self.__dict__, open(path, 'w'), indent='\t')

def die(msg):
	sys.stderr.write('error: ' + msg + '\n')
	sys.exit(1)

def do_init(args):
	# TODO validate projname

	confobj = ProjectConf(args.projdir, args.projname)
	
	confobj.local_images = args.local_images
	
	if args.saasman_edition:
		confobj.gatewayport = '8082'
		confobj.modules = ['saasman']
		confobj.subnet = '172.32.0.0/16'
		confobj.testdb_sqlsuffix = '-saasman'
	else:
		confobj.modules = ['loyalty']
		confobj.testdb_sqlsuffix = '-tenant'
	confobj.modules.append('globalenergy')
	try:
		os.mkdir(args.projdir)
	except Exception as e:
		# TODO enable
		#die('something went wrong while creating PROJDIR: ' + str(e))
		pass

	confobj.save()
	confobj.copy_compose_files()
	confobj.mkenv()
	
	# TODO FIXME not for regular init
	confobj.mktestenv()
	
	open(f'{confobj.projdir}/.env', 'w').write(confobj.get_dot_env())

def main():
	global modprops

	argparser = argparse.ArgumentParser(
	              prog = 'epicrmanage',
	              description = 'EpiCRM Management Script',
	              epilog = 'Copyright (C) 2022, 2023 Epixel Solutions Pvt Ltd')

	argparser.add_argument('--projdir', action='store', required=True)
	argparser.add_argument('--projname', action='store')
	argparser.add_argument('--epicrm-srcdir', action='store')
	argparser.add_argument('--local-images', action='store_true')
	argparser.add_argument('--saasman-edition', action='store_true')
	argparser.add_argument('-v', '--verbose', action='store_true')
	argparser.add_argument('action', action='store')

	args = argparser.parse_args()

	modprops = json.load(open(SCRIPTDIR + '/modules.json', 'r'))
	# TODO validate modprops; make sure one db is owned by one module only (even if it is shared between modules).

	if args.verbose:
		logging.basicConfig(level=logging.INFO)

	if args.action == 'init':
		if args.projname == None:
			die('--projname expected for action "init"')
		
		do_init(args)
	else:
		if args.projname != None:
			die('--projname should not be given for actions other than "init"')

		confobj = project_conf_new_from_projdir(args.projdir)

		if args.action == 'docker-pull':
			confobj.docker_pull()
		elif args.action == 'copy-compose-files':
			confobj.copy_compose_files()
		elif args.action == 'down':
			confobj.down()
		elif args.action == 'filltestdb':
			if args.epicrm_srcdir == None:
				die('--epicrm-srcdir must be set for --filltestdb')

			confobj.filltestdb(args.epicrm_srcdir)
		elif args.action == 'generate-gateway-conf':
			confobj.generate_gateway_conf()
		elif args.action == 'init-fix-missing':
			confobj.init_fix_missing()
		elif args.action == 'setup':
			confobj.initdb()
		elif args.action == 'reload-gateway':
			confobj.reload_gateway()
		elif args.action == 'up':
			confobj.up()
		else:
			die('invalid action.')

def project_conf_new_from_projdir(projdir):
		path = projdir + '/config.json'
		jsonobj = json.load(open(path, 'r'))
		
		projobj = ProjectConf(projdir, jsonobj['projname'])
		projobj.modules = jsonobj['modules']
		projobj.testdb_sqlsuffix = jsonobj['testdb_sqlsuffix']
		
		if 'local_images' in jsonobj:
			projobj.local_images = jsonobj['local_images']
		
		return projobj

if __name__ == '__main__':
	main()
