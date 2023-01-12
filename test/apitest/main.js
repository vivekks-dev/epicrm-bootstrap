import assert from 'assert'
import fetch from 'node-fetch'

import * as helpers from './helpers.js'
import * as myssert from './assert.js'
import { config, init } from './config.js'
import { test_change_password } from './change-password.js'
import { test_login, test_recoverylogin_rejects_normalpass } from './login.js'
import { test_get_loyalty_my_permissions } from './loyalty.js'
import { test_get_users } from './get-users.js'
import { test_post_organizations } from './org.js'
import { test_post_users } from './post-users.js'
import { test_get_saasman_tenants } from './saasman.js'
import { test_sys_auth, test_sys_unauth } from './sys.js'

var globstate = { saasmanMode: false, validBearerToken: null }

async function main() {
	let args = process.argv.slice(2)
	
	if(args.length === 0) {
		console.log('Selecting tenant mode...')
		globstate.saasmanMode = false
		init(false)
	} else if(args.length === 1 && args[0] === '-saasman') {
		console.log('Selecting saasman mode...')
		globstate.saasmanMode = true
		init(true)
	} else {
		process.stderr.write('USAGE: <command> [-saasman]\n')
		return 1
	}

	let res = null // TODO REM eventually

	await test_sys_unauth()

	globstate.validBearerToken = await test_login()

	await test_sys_auth(globstate.validBearerToken)

	console.log('Test: /users/whoami: GET without Authorization')
	await helpers.test_without_authorization(config.APISERV + '/users/whoami', 'GET')

	console.log('Test: /users/whoami: GET with invalid Authorization')
	await helpers.test_with_invalid_authorization(config.APISERV + '/users/whoami', 'GET')

	console.log('Test: /users/whoami: GET with valid Authorization')
	await myssert.assertWhoAmI(globstate.validBearerToken, '5342c632-398f-11ed-8adc-af8ba7a561bc')

	console.log('Test: /users/my-roles: GET without Authorization')
	await helpers.test_without_authorization(config.APISERV + '/users/my-roles', 'GET')

	console.log('Test: /users/my-roles: GET with inavlid Authorization')
	await helpers.test_with_invalid_authorization(config.APISERV + '/users/my-roles', 'GET')

	console.log('Test: /users/my-roles: GET with valid Authorization')
	res = await fetch(config.APISERV + '/users/my-roles', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + globstate.validBearerToken }
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	assert( JSON.stringify( (await res.json())['data'] ) === JSON.stringify(config.EXPDATA_ROLES) )


	console.log('Test: /users/my-permissions: GET without Authorization')
	await helpers.test_without_authorization(config.APISERV + '/users/my-permissions', 'GET')

	console.log('Test: /users/my-permissions: GET with inavlid Authorization')
	await helpers.test_with_invalid_authorization(config.APISERV + '/users/my-permissions', 'GET')

	console.log('Test: /users/my-permissions: GET with valid Authorization')
	res = await fetch(config.APISERV + '/users/my-permissions', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + globstate.validBearerToken }
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	assert( JSON.stringify( (await res.json())['data'] ) === JSON.stringify(config.EXPDATA_PERMS) )


	if(!globstate.saasmanMode)
		await test_get_loyalty_my_permissions(globstate.validBearerToken)


	console.log('Test: /users/5342c632-398f-11ed-8adc-af8ba7a561bc/public-profile: GET without auth')
	res = await fetch(config.APISERV + '/users/5342c632-398f-11ed-8adc-af8ba7a561bc/public-profile', {
		method: 'GET',
		headers: {}
	})
	assert(res.status === 401)
	myssert.assertContentType(res, 'application/json')
	assert((await res.json())['error'] === 'Unauthorized')
	assert(res.headers.get('www-authenticate') === 'Bearer')

	console.log('Test: /users/5342c632-398f-11ed-8adc-af8ba7a561bc/public-profile: GET with auth, own profile')
	res = await fetch(config.APISERV + '/users/5342c632-398f-11ed-8adc-af8ba7a561bc/public-profile', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + globstate.validBearerToken }
	})
	let json = await myssert.assert200Json(res)
	assert(json['data']['fullname'] === 'ജോണ്‍ ഡോ')

	console.log('Test: /users/5342c632-398f-11ed-8adc-af8ba7a561bc/public-profile: GET with auth, profile of somebody else')
	res = await fetch(config.APISERV + '/users/5ee2f5fc-398f-11ed-9c6c-db4f687550ad/public-profile', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + globstate.validBearerToken }
	})
	json = await myssert.assert200Json(res)
	assert(json['data']['fullname'] === 'Inactive Person')


	// TODO test with another access token also
	console.log('Test: /users/my-public-profile: GET with auth')
	res = await fetch(config.APISERV + '/users/my-public-profile', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + globstate.validBearerToken }
	})
	json = await myssert.assert200Json(res)
	assert(json['data']['fullname'] === 'ജോണ്‍ ഡോ')


	console.log('Test: /users/my-public-profile: PATCH')
	res = await fetch(config.APISERV + '/users/my-public-profile', {
		method: 'PATCH',
		headers: {
			'Authorization': 'Bearer ' + globstate.validBearerToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({"fullname": "My New Name"})
	})
	json = await myssert.assert200Json(res)
	assert(json['data'] === 'OK')

	console.log('Test: /users/my-public-profile: GET to make sure PATCH worked')
	res = await fetch(config.APISERV + '/users/my-public-profile', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + globstate.validBearerToken }
	})
	json = await myssert.assert200Json(res)
	assert(json['data']['fullname'] === 'My New Name')

	// So that these tests can be run again
	console.log('Test: /users/my-public-profile: PATCH (revert)')
	res = await fetch(config.APISERV + '/users/my-public-profile', {
		method: 'PATCH',
		headers: {
			'Authorization': 'Bearer ' + globstate.validBearerToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({"fullname": "ജോണ്‍ ഡോ"})
	})
	json = await myssert.assert200Json(res)
	assert(json['data'] === 'OK')

	if(!globstate.saasmanMode)
		await test_post_organizations(globstate.validBearerToken)

	if(globstate.saasmanMode)
		await test_get_saasman_tenants(globstate.validBearerToken)

	await test_get_users(globstate.validBearerToken)
	
	await test_post_users(globstate.validBearerToken)

	await test_change_password(globstate.validBearerToken)

	console.log('Test: /token/logout: POST')
	res = await fetch(config.APISERV + '/token/logout', {
		method: 'POST',
		headers: { 'Authorization': 'Bearer ' + globstate.validBearerToken }
	})

	assert(res.status === 200)


	console.log('Test: /users/whoami: GET with valid Authorization after logout')
	await myssert.assertWhoAmI(globstate.validBearerToken, '5342c632-398f-11ed-8adc-af8ba7a561bc', true)

	await test_recoverylogin_rejects_normalpass()

	// TODO profile of non-existing user, non-UUID uid, etc.

	// TODO SECURITY test to make sure the user cannot inject X-EPICRM-UID header

	// TODO test /login/reset-password -- /login/with-recoverypass flow
	// TODO make sure a recoverypass can't be used again

	// TODO test GET /organization
	// TODO test POST /users

	// TODO test the read-only mode
	
	return 0
}

process.exit(await main())
