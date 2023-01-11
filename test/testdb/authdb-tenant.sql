INSERT INTO sysinfo (sys_org_id) VALUES ('29be3f18-37db-11ed-95e6-578b37499fdd');

INSERT INTO role_permission (role, permission)
	VALUES ('tenant-admin', 'create-organizations');

INSERT INTO role_permission (role, permission)
	VALUES ('tenant-admin', 'list-organizations');

INSERT INTO user_org_role (uid, organization, role) VALUES(
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  '29be3f18-37db-11ed-95e6-578b37499fdd',
  'tenant-admin');

INSERT INTO user_org_role (uid, organization, role) VALUES(
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  '29be3f18-37db-11ed-95e6-578b37499fdd',
  'org-registrar');

-- for testing purposes (such a role could cause null outputs in JOIN)
INSERT INTO user_org_role (uid, organization, role) VALUES(
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  '29be3f18-37db-11ed-95e6-578b37499fdd',
  'role-with-no-permissions');

INSERT INTO user_org_role (uid, organization, role) VALUES(
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  '52f640b0-37db-11ed-86c5-b774bd35a6d1',
  'business-admin');

INSERT INTO user_org_role (uid, organization, role) VALUES(
  '5ee2f5fc-398f-11ed-9c6c-db4f687550ad',
  '5860adba-37db-11ed-becb-d74a5fc227d4',
  'business-admin');
