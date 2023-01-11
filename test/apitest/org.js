import assert from 'assert'
import fetch from 'node-fetch'

import { config } from './config.js'

async function request_orgs_register(bearerToken, reqobj) {
	let res = await fetch(config.APISERV + '/organizations', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + bearerToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(reqobj)
	})

	return res
}

export async function test_post_organizations(validBearerToken) {
	let res

	// TODO
	//console.log('Test: /organizations: POST with invalid body')

	console.log('Test: /organizations: POST with restricted org type (system)')
	let reqobj =  { "parent": null, "type": "system", "short_name": "mybg1", "title": "My Business Group 1", "admin": "" }
	res = await request_orgs_register(validBearerToken, reqobj)
	assert(res.status != 200)
	let errcode = res.headers.get('content-type').includes('application/json')?
		         (await res.json())['error']: await res.text()
	// No longer RESTRICTED_ORGTYPE works now that DBs for tenants don't have these types at all
	assert(res.status === 403 && errcode === 'RESTRICTED_ORGTYPE'
		     || errcode.indexOf('Value is not nullable') >= 0)

	console.log('Test: /organizations: POST with restricted org type (tenant)')
	reqobj =  { "parent": null, "type": "system", "short_name": "mybg1", "title": "My Business Group 1", "admin": "" }
	res = await request_orgs_register(validBearerToken, reqobj)
	assert(res.status != 200)
	errcode = res.headers.get('content-type').includes('application/json')?
		         (await res.json())['error']: await res.text()
	// No longer RESTRICTED_ORGTYPE works now that DBs for tenants don't have these types at all
	assert(res.status === 403 && errcode === 'RESTRICTED_ORGTYPE'
		     || errcode.indexOf('Value is not nullable') >= 0)

	console.log('Test: /organizations: POST with parent that the user has no access to')
	reqobj = { "parent": "903c6eea-37db-11ed-a976-bfbb4e5cabf8", "type": "business_group", "short_name": "", "title": "", "admin": "" }
	res = await request_orgs_register(validBearerToken, reqobj)
	assert(res.status === 403)
	assert((await res.json())['error'] === 'USER_NOT_ALLOWED')

	console.log('Test: /organizations: POST with invalid orgtype')
	reqobj = { "parent": "29be3f18-37db-11ed-95e6-578b37499fdd", "type": "invalid_orgtype", "short_name": "", "title": "", "admin": "" }
	res = await request_orgs_register(validBearerToken, reqobj)
	assert(res.status === 400)
	assert((await res.json())['error'] === 'INVALID_ORGTYPE')

	console.log('Test: /organizations: POST with invalid org hierarchy')
	reqobj = { "parent": "29be3f18-37db-11ed-95e6-578b37499fdd", "type": "business", "short_name": "", "title": "", "admin": "" }
	res = await request_orgs_register(validBearerToken, reqobj)
	assert(res.status === 400)
	assert((await res.json())['error'] === 'INVALID_ORG_HIERARCHY')

	console.log('Test: /organizations: POST with non-existent parent')
	reqobj = { "parent": "29be3f18-37db-11ed-95e6-578b37499fd1", "type": "business", "short_name": "", "title": "", "admin": "" }
	res = await request_orgs_register(validBearerToken, reqobj)
	assert(res.status === 400)
	assert((await res.json())['error'] === 'PARENT_ORG_NOEXIST')

	console.log('Test: /organizations: POST with valid request')
	reqobj = { "parent": "29be3f18-37db-11ed-95e6-578b37499fdd", "type": "business_group", "short_name": "mybg1", "title": "My Business Group 1", "admin": "" }
	res = await request_orgs_register(validBearerToken, reqobj)
	assert(res.status === 200)
	assert((await res.json())['data']['organization'].length === 36) // uuid

	// TODO success and orgid
}
