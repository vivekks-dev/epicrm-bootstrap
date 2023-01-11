import assert from 'assert'
import fetch from 'node-fetch'

import { config } from './config.js'

export function assertWwwAuthHas(res, scheme) {
	assert(res.headers.get('www-authenticate').split(',').indexOf(scheme) >= 0)
}

export async function assertAuth200(login, password, uid) {
	return await assertAuth200Custom('login', login, password, uid)
}

export async function assertAuth200Recpass(login, recpass, uid) {
	return await assertAuth200Custom('login/with-recoverypass', login, recpass, uid)
}

export async function assertAuth200Custom(endpoint, login, password, uid) {
	let res = await fetch(config.APISERV + '/' + endpoint, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + Buffer.from(login + ':' + password).toString('base64'),
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})

	assert(res.status === 200)
	assertContentType(res, 'application/json')
	assert(res.headers.get('www-authenticate') === null)
	const loginData = (await res.json())['data']
	assert(loginData['uid'] === uid)
	assert(typeof loginData['token'] === 'string')

	return loginData['token']
}

export async function assertAuth401(login, password) {
	return await assertAuth401Custom('login', login, password, 'Unauthorized: invalid credentials')
}

export async function assertAuth401RecpassPasserror(login, password) {
	return await assertAuth401Custom('login/with-recoverypass', login, password, "Unauthorized: invalid or expired recoverypass")
}

export async function assertAuth401RecpassLoginerror(login, password) {
	return await assertAuth401Custom('login/with-recoverypass', login, password, "Unauthorized: invalid credentials")
}

export async function assertAuth401Custom(endpoint, login, password, msg) {
	let res = await fetch(config.APISERV + '/' + endpoint, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + Buffer.from(login + ':' + password).toString('base64'),
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})

	assert401BasicJson(res)
	let err = (await res.json())['error']
	assert(err === msg)
}

export async function assertAuth403(login, password) {
	return await assertAuth403Custom('login', login, password)
}

// TODO REM?
export async function assertAuth403Recpass(login, password) {
	return await assertAuth403Custom('login/with-recoverypass', login, password)
}

export async function assertAuth403Custom(endpoint, login, password) {
	let res = await fetch(config.APISERV + '/' + endpoint, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + Buffer.from(login + ':' + password).toString('base64'),
			'X-CLIENT-ID': '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
			'X-CLIENT-SECRET': 'mayIAccess?',
		}
	})

	assert403Json(res)
	// TODO message
	//assert((await res.json())['error'] === 'Unauthorized: invalid credentials')
}

export function assertContentType(res, type) {
	let ct = res.headers.get('content-type')
	assert(ct)
	assert(ct.includes(type))
}

export async function assert200Json(res) {
	assert(res.status === 200)
	assertContentType(res, 'application/json')
	assert(res.headers.get('www-authenticate') === null)
	
	let json = await res.json()
	assert(typeof json['error'] === 'undefined')
	
	return json
}

export function assert401BasicJson(res) {
	assert(res.status === 401)
	assertContentType(res, 'application/json')
	assert(res.headers.get('www-authenticate') === 'Basic')
}

export function assert403Json(res) {
	assert(res.status === 403)
	assertContentType(res, 'application/json')
}

export async function assertWhoAmI(bearerToken, uid, failUnauth = false) {
	let res = await fetch(config.APISERV + '/users/whoami', {
		method: 'GET',
		headers: { 'Authorization': 'Bearer ' + bearerToken }
	})

	if(failUnauth) {
		assert(res.status === 401)
		assertContentType(res, 'application/json')
		let jsonerr = (await res.json())['error']
		assert(jsonerr === 'Unauthorized: invalid or expired token' || 'Unauthorized')
		assert(res.headers.get('www-authenticate') === 'Bearer')
	}
	else {
		assert(res.status === 200)
		assertContentType(res, 'application/json')
		assert((await res.json())['data']['uid'] === uid)
	}
}
