const SAMPLE_REQ_POST_USER = {
    "users": [
        {
            "email": "newcomer1@example.com",
            "password": "StrongPassword",
            "fullname": "Another John Doe",
            "roles": [
                {
                    "organization": "%ROOT_ORG_ID%",
                    "role": "observer"
                }
            ]
        }
    ]
}

const EXPDATA_USERS_COMMON = [
        {
            "uid": "5ee2f5fc-398f-11ed-9c6c-db4f687550ad",
            "fullname": "Inactive Person",
            "email": "inactive@example.com",
            "email_verified_time": "2022-12-07T11:42:06+00:00",
            "phone": null,
            "phone_verified_time": null,
            "registered_by_user": null,
            "registered_time": null
        },
        {
            "uid": "60633a68-398f-11ed-8378-8b40331d9b1d",
            "fullname": "InvalidHash Person",
            "email": "invhash@example.com",
            "email_verified_time": "2022-12-07T11:43:06+00:00",
            "phone": null,
            "phone_verified_time": null,
            "registered_by_user": null,
            "registered_time": null
        },
        {
            "uid": "5342c632-398f-11ed-8adc-af8ba7a561bc",
            "fullname": "ജോണ്‍ ഡോ",
            "email": "somebody@example.com",
            "email_verified_time": "2022-12-07T11:41:06+00:00",
            "phone": null,
            "phone_verified_time": null,
            "registered_by_user": null,
            "registered_time": null
        }
    ];

const config_tenant = {
	APISERV: 'http://localhost:8081',
	ROOT_ORG_ID: '29be3f18-37db-11ed-95e6-578b37499fdd',
	VALID_LOGIN_1: 'somebody@example.com',
	VALID_PASSWD_1: 'mayIComeIn?',
	EXPDATA_ROLES: [{"uid":"5342c632-398f-11ed-8adc-af8ba7a561bc","organization":"29be3f18-37db-11ed-95e6-578b37499fdd","role":"tenant-admin"},
  {"uid":"5342c632-398f-11ed-8adc-af8ba7a561bc","organization":"29be3f18-37db-11ed-95e6-578b37499fdd","role":"org-registrar"},
  {"uid":"5342c632-398f-11ed-8adc-af8ba7a561bc","organization":"29be3f18-37db-11ed-95e6-578b37499fdd","role":"role-with-no-permissions"},
  {"uid":"5342c632-398f-11ed-8adc-af8ba7a561bc","organization":"52f640b0-37db-11ed-86c5-b774bd35a6d1","role":"business-admin"}],
	EXPDATA_PERMS: [
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "list-roles"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "create-users"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "list-users"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "manage-users-of-role:observer"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "create-organizations"
        },
        {
            "organization": "29be3f18-37db-11ed-95e6-578b37499fdd",
            "permission": "list-organizations"
        }
    ],
  EXPDATA_USERS: EXPDATA_USERS_COMMON,
}

const config_saasman = {
	APISERV: 'http://localhost:8082',
	ROOT_ORG_ID: '41c5a4a8-656b-11ed-95c9-6ffe2af11337',
	VALID_LOGIN_1: 'somebody@example.com',
	VALID_PASSWD_1: 'mayIComeIn?',
	EXPDATA_ROLES: [
        {
            "uid": "5342c632-398f-11ed-8adc-af8ba7a561bc",
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "role": "sysadmin"
        },
        {
            "uid": "5342c632-398f-11ed-8adc-af8ba7a561bc",
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "role": "tenant-admin"
        }
    ],
	EXPDATA_PERMS: [
        {
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "permission": "list-roles"
        },
        {
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "permission": "create-users"
        },
        {
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "permission": "list-users"
        },
        {
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "permission": "manage-users-of-role:observer"
        },
        {
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "permission": "manage-users-of-role:sysadmin"
        },
        {
            "organization": "41c5a4a8-656b-11ed-95c9-6ffe2af11337",
            "permission": "manage-users-of-role:observer"
        }
    ],
  EXPDATA_USERS: EXPDATA_USERS_COMMON,
}

export var config = null

export function init(saasman = false) {
	config = saasman? config_saasman: config_tenant
	config.SAMPLE_REQ_POST_USER = JSON.parse(JSON.stringify(SAMPLE_REQ_POST_USER).replaceAll('%ROOT_ORG_ID%', config.ROOT_ORG_ID))
}
