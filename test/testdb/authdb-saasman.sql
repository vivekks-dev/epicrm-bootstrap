INSERT INTO sysinfo (sys_org_id) VALUES ('41c5a4a8-656b-11ed-95c9-6ffe2af11337');

INSERT INTO role_permission(role, permission) VALUES (
  'sysadmin', 'manage-users-of-role:sysadmin'
);

INSERT INTO role_permission(role, permission) VALUES (
  'sysadmin', 'manage-users-of-role:observer'
);

-- TODO rem the role sysadmin eventually and use tenant-admin instead
INSERT INTO user_org_role (uid, organization, role) VALUES(
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  '41c5a4a8-656b-11ed-95c9-6ffe2af11337',
  'sysadmin');

INSERT INTO user_org_role (uid, organization, role) VALUES(
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  '41c5a4a8-656b-11ed-95c9-6ffe2af11337',
  'tenant-admin');
