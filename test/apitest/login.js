import assert from 'assert'
import fetch from 'node-fetch'

import * as myssert from './assert.js'
import { config } from './config.js'

export async function test_login() {
	let res = null

	// TODO tests for X-API-KEY and X-API-SECRET for /login
	// TODO tests for /login from app with everything okay except for the `enabled` field

	// TODO test token expiry (presence of the field and it's value)

	console.log('Test: /login: GET not allowed')
	res = await fetch(config.APISERV + '/login')
	assert(res.status === 405 || (res.status === 400 && (await res.json())['error'] === 'method not allowed'))


	console.log('Test: /login: POST without Authorization')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST'
	})
	myssert.assert401BasicJson(res)
	assert((await res.json())['error'] === 'Unauthorized: missing Basic Authorization header')


	console.log('Test: /login: POST with missing client_id')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=' // username:password
		}
	})
	myssert.assert401BasicJson(res)
	assert((await res.json())['error'] === 'Unauthorized: invalid client id')


	console.log('Test: /login: POST with invalid client_id')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=', // username:password
			'X-CLIENT-ID': 'SOMETHING-INVALID'
		}
	})
	myssert.assert401BasicJson(res)
	assert((await res.json())['error'] === 'Unauthorized: invalid client id')


	console.log('Test: /login: POST with missing client_secret')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=', // username:password
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1'
		}
	})
	myssert.assert401BasicJson(res)
	assert((await res.json())['error'] === 'Unauthorized: invalid client credentials')


	console.log('Test: /login: POST with invalid client_secret')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=', // username:password
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
		}
	})
	myssert.assert401BasicJson(res)
	assert((await res.json())['error'] === 'Unauthorized: invalid client credentials')


	console.log('Test: /login: POST with valid client_secret 1')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=', // username:password
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})
	myssert.assert401BasicJson(res)
	assert((await res.json())['error'] === 'Unauthorized: invalid credentials')


	console.log('Test: /login: POST with valid client_secret 2')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=', // username:password
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': 'mayIRequest?',
		}
	})
	myssert.assert401BasicJson(res)
	assert((await res.json())['error'] === 'Unauthorized: invalid credentials')


	console.log('Test: /login: POST with valid credentials, non-direct-login client')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic c29tZWJvZHlAZXhhbXBsZS5jb206bWF5SUNvbWVJbj8=', // somebody@example.com:mayIComeIn?
			'X-CLIENT-ID': 'db1cf7a4-45dc-11ed-a84c-03c92055383b',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})
	myssert.assert403Json(res)
	assert((await res.json())['error'] === 'Forbidden: client not allowed to perform direct login')


	console.log('Test: /login: POST with valid credentials, non-SSR client')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic c29tZWJvZHlAZXhhbXBsZS5jb206bWF5SUNvbWVJbj8=', // somebody@example.com:mayIComeIn?
			'X-CLIENT-ID': 'f0a2eb60-45dc-11ed-9d59-97d50e25f528',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})
	myssert.assert403Json(res)
	assert((await res.json())['error'] === 'Forbidden: non-SSR client')


	console.log('Test: /login: POST with valid credentials for inactive user')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic aW5hY3RpdmVAZXhhbXBsZS5jb206bWF5SUNvbWVJbj8=', // inactive@example.com:mayIComeIn?
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})
	assert(res.status === 403)
	// TODO check res json

	console.log('Test: /login: POST for a user whose password is stored with an unsupported hashing algorithm')
	res = await fetch(config.APISERV + '/login', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic aW52aGFzaEBleGFtcGxlLmNvbTptYXlJQ29tZUluPw==', // invhash@example.com:mayIComeIn?
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})
	assert(res.status === 500)
	// TODO check res json


	console.log('Test: /login: POST with incorrect login and password')
	await myssert.assertAuth401('username', 'password')


	console.log('Test: /login: POST with incorrect password')
	await myssert.assertAuth401(config.VALID_LOGIN_1, 'password')


	console.log('Test: /login: POST with incorrect login')
	await myssert.assertAuth401('somebody@example.com1', config.VALID_PASSWD_1)


	console.log('Test: /login: POST with correct Authorization')
	return await myssert.assertAuth200(config.VALID_LOGIN_1, config.VALID_PASSWD_1, '5342c632-398f-11ed-8adc-af8ba7a561bc')
}

// /login/with-recoverypass: make sure regular password is rejected
export async function test_recoverylogin_rejects_normalpass() {
	console.log('Test: /login/with-recoverypass: POST with incorrect login and password')
	await myssert.assertAuth401RecpassLoginerror('username', 'password')


	console.log('Test: /login/with-recoverypass: POST with incorrect password')
	await myssert.assertAuth401RecpassPasserror(config.VALID_LOGIN_1, 'password')


	console.log('Test: /login/with-recoverypass: POST with incorrect login')
	await myssert.assertAuth401RecpassLoginerror('somebody@example.com1', config.VALID_PASSWD_1)


	console.log('Test: /login/with-recoverypass: POST with correct username and password')
	await myssert.assertAuth401RecpassPasserror(config.VALID_LOGIN_1, config.VALID_PASSWD_1)
}
