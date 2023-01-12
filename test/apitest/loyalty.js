import assert from 'assert'
import fetch from 'node-fetch'

import * as helpers from './helpers.js'
import * as myssert from './assert.js'
import { config } from './config.js'

const EXP_LOYALTYPERMS = [
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "loyalty:can-add-points-to-all-tenant-customers"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "loyalty:can-set-exchange-rate"
        },
        {
            "organization": "52f640b0-37db-11ed-86c5-b774bd35a6d1",
            "permission": "loyalty:can-add-points-to-all-business-customers"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "loyalty:create-tier"
        },
        {
            "organization": "52f640b0-37db-11ed-86c5-b774bd35a6d1",
            "permission": "loyalty:create-tier"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "loyalty:list-tiers"
        },
        {
            "organization": "52f640b0-37db-11ed-86c5-b774bd35a6d1",
            "permission": "loyalty:list-tiers"
        }
    ]

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
	assert( JSON.stringify( (await res.json())['data'] ) === JSON.stringify(EXP_LOYALTYPERMS) )
}


export async function test_loyalty_get_tiers(validBearerToken) {
	let res

	console.log('Test: /loyalty/tiers: GET without Authorization')
	await helpers.test_without_authorization(config.APISERV + '/loyalty/tiers', 'GET');

	console.log('Test: /loyalty/tiers: GET with inavlid Authorization')
	await helpers.test_with_invalid_authorization(config.APISERV + '/loyalty/tiers', 'GET');

	console.log('Test: /loyalty/tiers: GET with valid Authorization')
	res = await fetch(config.APISERV + '/loyalty/tiers', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + validBearerToken }
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')

	let dataJson = await res.json()
	assert(dataJson.hasOwnProperty('data'))
	assert(dataJson.data.length > 0)
	assert(dataJson.data[0].hasOwnProperty('tier'))
	
	console.log('Test: /loyalty/tiers: GET with valid Authorization and parameters')
	res = await fetch(config.APISERV + '/loyalty/tiers?orgId=29be3f18-37db-11ed-95e6-578b37499fdd', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + validBearerToken }
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')

	let dataJson1 = await res.json()
	assert(dataJson1.hasOwnProperty('data'))
	assert(dataJson1.data.length > 0)
	assert(dataJson1.data[0].hasOwnProperty('tier'))
}

export async function test_loyalty_add_tiers(validBearerToken) {
	let res

	console.log('Test: /loyalty/tiers: POST without Authorization')
	await helpers.test_without_authorization(config.APISERV + '/loyalty/tiers', 'POST');

	console.log('Test: /loyalty/tiers: POST with inavlid Authorization')
	await helpers.test_with_invalid_authorization(config.APISERV + '/loyalty/tiers', 'POST');

	console.log('Test: /loyalty/tiers: POST with valid Authorization')
	res = await fetch(config.APISERV + '/loyalty/tiers', {
		method: 'POST',
		headers: { 'Authorization': 'Bearer ' + validBearerToken },
		body: {
			"name": "Platinum Badge",
			"logo_url": "https://assets.epixelmlmsoftware.com/sites/all/themes/epixel_mlm/epixel-mlm-software-logo.svg",
			"note": "Platinum badge",
			"organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
			"status": true
		}
	})
	assert(res.status === 200)
	myssert.assertContentType(res, 'application/json')

	let dataJson = await res.json()
	assert(dataJson.hasOwnProperty('data'))
	assert(dataJson.data.hasOwnProperty('tier'))
}
