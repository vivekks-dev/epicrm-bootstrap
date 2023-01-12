import assert from 'assert'
import fetch from 'node-fetch'

import * as helpers from './helpers.js'
import * as myssert from './assert.js'
import { config } from './config.js'

// TODO post

export async function test_get_saasman_tenants(validBearerToken) {
	let res

	console.log('Test: /saasman/tenants: GET without Authorization')
	await helpers.test_without_authorization(config.APISERV + '/saasman/tenants', 'GET');

	console.log('Test: /saasman/tenants: GET with inavlid Authorization')
	await helpers.test_with_invalid_authorization(config.APISERV + '/saasman/tenants', 'GET');

	console.log('Test: /saasman/tenants: GET with valid Authorization')
	res = await fetch(config.APISERV + '/saasman/tenants', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + validBearerToken }
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	let expdata = []
	assert( JSON.stringify( (await res.json())['data'] ) === JSON.stringify(expdata) )
}
