import assert from 'assert'
import fetch from 'node-fetch'

import * as helpers from './helpers.js'
import * as myssert from './assert.js'
import { config } from './config.js'

export async function test_get_loyalty_my_permissions(validBearerToken) {
	let res

	console.log('Test: /loyalty/my-permissions: GET without Authorization')
	await helpers.test_without_authorization(config.APISERV + '/loyalty/my-permissions', 'GET');

	console.log('Test: /loyalty/my-permissions: GET with inavlid Authorization')
	await helpers.test_with_invalid_authorization(config.APISERV + '/loyalty/my-permissions', 'GET');

	// Also makes sure the following doesn't appear in the output due to the role
	// "role-with-no-permissions":
	// { "organization": "29be3f18-37db-11ed-95e6-578b37499fdd", "permission": null }
	console.log('Test: /loyalty/my-permissions: GET with valid Authorization')
	res = await fetch(config.APISERV + '/loyalty/my-permissions', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + validBearerToken }
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')
	let expdata = [{"organization":"29be3f18-37db-11ed-95e6-578b37499fdd","permission":"loyalty:can-add-points-to-all-tenant-customers"}, 
		 {"organization":"29be3f18-37db-11ed-95e6-578b37499fdd","permission":"loyalty:can-set-exchange-rate"}, 
		 {"organization":"52f640b0-37db-11ed-86c5-b774bd35a6d1","permission":"loyalty:can-add-points-to-all-business-customers"}]
	assert( JSON.stringify( (await res.json())['data'] ) === JSON.stringify(expdata) )
}
