INSERT INTO role_permission (role, permission)
  VALUES('tenant-admin', 'loyalty:can-add-points-to-all-tenant-customers');

INSERT INTO role_permission (role, permission)
  VALUES('tenant-admin', 'loyalty:can-set-exchange-rate');

INSERT INTO role_permission (role, permission)
  VALUES('business-admin', 'loyalty:can-add-points-to-all-business-customers');
