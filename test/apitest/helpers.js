import assert from 'assert'
import fetch from 'node-fetch'

import * as myssert from './assert.js'

export async function test_without_authorization(url, method) {
	let res = await fetch(url, {
		method: method,
		headers: {}
	})
	assert(res.status === 401)
	myssert.assertContentType(res, 'application/json')
	let jsonerr = (await res.json())['error']
	assert(jsonerr === 'Unauthorized: missing or ill-formed bearer token' || jsonerr === 'Unauthorized')
	assert(res.headers.get('www-authenticate') === 'Bearer')
}

export async function test_with_invalid_authorization(url, method) {
	let res = await fetch(url, {
		method: method,
		headers: { 'Authorization': 'Bearer 6e165c66-39a4-11ed-a979-036ce7fd0fbb'}
	})
	assert(res.status === 401)
	myssert.assertContentType(res, 'application/json')
	let jsonerr = (await res.json())['error']
	assert(jsonerr === 'Unauthorized: invalid or expired token' || 'Unauthorized')
	assert(res.headers.get('www-authenticate') === 'Bearer')
}
