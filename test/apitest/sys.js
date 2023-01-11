import assert from 'assert'
import fetch from 'node-fetch'

import * as myssert from './assert.js'
import { config } from './config.js'

async function test_get_roles(validBearerToken) {
	let res = null

	console.log('Test: /users/roles: GET')
	res = await fetch(config.APISERV + '/users/roles', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + validBearerToken }
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	let roles = (await res.json())['data']
	assert(roles.indexOf('tenant-admin') >= 0)
	assert(roles.indexOf('trusted-server-app') >= 0)
}

async function test_ping() {
	let res = null

	console.log('Test: /ping: GET')
	res = await fetch(config.APISERV + '/ping')
	assert(res.status === 200)
	myssert.assertContentType(res, 'text/plain')
	assert((await res.text()).trim() === 'pong')
}

async function test_sysinfo() {
	let res = null

	// TODO test to make sure /auth/checkpoint is internal-only


	console.log('Test: /sysinfo: GET')
	res = await fetch(config.APISERV + '/sysinfo', {
		method: 'GET',
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	assert( JSON.stringify( (await res.json())['data']['root_organization'] ) === JSON.stringify(config.ROOT_ORG_ID) )
}

export async function test_sys_auth(validBearerToken) {
	await test_get_roles(validBearerToken)
}

export async function test_sys_unauth(validBearerToken) {
	await test_ping()
	await test_sysinfo()
}
