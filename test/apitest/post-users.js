import assert from 'assert'
import fetch from 'node-fetch'

import * as myssert from './assert.js'
import { config } from './config.js'

// TODO FIXME this fails because POST /users does not create public_profile entry
async function assertUserExists(uid, bearerToken) {
	let res = await request_get_users(bearerToken)
	assert(res.status === 200)
	let data = (await res.json())['data']

	let found = false
	for(let i = 0; i < data.length && !found; i++)
		if(data[i]['uid'] === uid)
			found = true

	assert(found)
}

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

async function request_post_users(bearerToken, reqobj) {
	let res = await fetch(config.APISERV + '/users', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + bearerToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(reqobj)
	})

	return res
}

export async function test_post_users(validBearerToken) {
	let res
	let reqobj
	let data

	console.log('Test: /users: POST without authorization')
	reqobj = config.SAMPLE_REQ_POST_USER
	res = await request_post_users('iAmSpecial', reqobj)
	assert(res.status === 401)
	
	// TODO invalid request body

	// TODO valid body, but less priv. user

	console.log('Test: /users: POST with valid request')
	reqobj = config.SAMPLE_REQ_POST_USER
	res = await request_post_users(validBearerToken, reqobj)
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	
	data = (await res.json())['data']
	assert(data.length === reqobj['users'].length)
	
	let uid = data[0]['uid']
	assert(uid.length === 36) // uuid

	await assertUserExists(uid, validBearerToken)
	// TODO check values returned by GET, including registered_by_user

	console.log('Test: /users: POST with valid but existing-user request')
	reqobj = config.SAMPLE_REQ_POST_USER
	res = await request_post_users(validBearerToken, reqobj)
	assert(res.status === 400)
	myssert.assertContentType(res, 'application/json')
	data = (await res.json())['data']
	assert(data[0]['can_succeed'] === false)
	assert(data[0]['error'] === 'ALREADY_EXISTS')
	assert(data[0]['uid'] === '00000000-0000-0000-0000-000000000000')
	await assertUserExists(uid, validBearerToken)


	// TODO duplicate user
	// TODO invalid role
	// TODO empty password
	
	// TODO all the error codes specified in API doc (like FORBIDDEN_TO_SET_ROLE)
	
	// TODO make sure the process is atomic as promised by the API doc.
}
