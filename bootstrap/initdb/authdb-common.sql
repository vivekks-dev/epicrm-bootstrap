INSERT INTO role_permission (role, permission)
	VALUES ('tenant-admin', 'list-roles');

INSERT INTO role_permission (role, permission)
	VALUES ('tenant-admin', 'create-users');

INSERT INTO role_permission (role, permission)
	VALUES ('tenant-admin', 'list-users');

INSERT INTO role_permission (role, permission)
	VALUES ('tenant-admin', 'manage-users-of-role:observer');

INSERT INTO role_permission (role, permission)
	VALUES ('trusted-server-app', 'create-users');

INSERT INTO role_permission (role, permission)
	VALUES ('trusted-server-app', 'list-users');
