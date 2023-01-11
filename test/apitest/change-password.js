import assert from 'assert'
import fetch from 'node-fetch'

import * as myssert from './assert.js'
import { config } from './config.js'

export async function test_change_password(validBearerToken) {
	let res = null

	console.log('Test: /users/change-password: POST')
	res = await fetch(config.APISERV + '/users/change-password', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + validBearerToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ password: "mayIEnter?" })
	})
	assert(res.status === 200)


	console.log('Test: /login: POST with old credentials after password change')
	await myssert.assertAuth401(config.VALID_LOGIN_1, config.VALID_PASSWD_1)


	console.log('Test: /login: POST with new credentials after password change')
	await myssert.assertAuth200(config.VALID_LOGIN_1, 'mayIEnter?', '5342c632-398f-11ed-8adc-af8ba7a561bc')


	console.log('Test: /users/change-password: POST with empty password')
	res = await fetch(config.APISERV + '/users/change-password', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + validBearerToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ password: "" })
	})
	assert(res.status === 200)

	console.log('Test: /login: POST with correct but empty password')
	await myssert.assertAuth403(config.VALID_LOGIN_1, '')


	console.log('Test: /users/change-password: POST (restore)')
	res = await fetch(config.APISERV + '/users/change-password', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + validBearerToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ password: config.VALID_PASSWD_1 })
	})
	assert(res.status === 200)

	console.log('Test: /login: POST with old credentials after password restore')
	await myssert.assertAuth200(config.VALID_LOGIN_1, config.VALID_PASSWD_1, '5342c632-398f-11ed-8adc-af8ba7a561bc')
}
