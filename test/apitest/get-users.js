import assert from 'assert'
import fetch from 'node-fetch'

import * as myssert from './assert.js'
import { config } from './config.js'

// TODO duplicate in post-users.js
async function request_get_users(bearerToken) {
	let res = await fetch(config.APISERV + '/users', {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + bearerToken,
			'Content-Type': 'application/json'
		}
	})

	return res
}

export async function test_get_users(validBearerToken) {
	let res
	let reqobj
	let data

	console.log('Test: /users: GET without authorization')
	res = await request_get_users('iAmSpecial')
	assert(res.status === 401)
	
	// TODO less priv. user

	console.log('Test: /users: GET with valid request')
	res = await request_get_users(validBearerToken)
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	assert( JSON.stringify( (await res.json())['data'] ) === JSON.stringify(config.EXPDATA_USERS) )
}
