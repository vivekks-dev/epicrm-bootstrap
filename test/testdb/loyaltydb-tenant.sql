INSERT INTO role_permission (role, permission)
  VALUES('tenant-admin', 'loyalty:can-add-points-to-all-tenant-customers');

INSERT INTO role_permission (role, permission)
  VALUES('tenant-admin', 'loyalty:can-set-exchange-rate');

INSERT INTO role_permission (role, permission)
  VALUES('business-admin', 'loyalty:can-add-points-to-all-business-customers');

INSERT INTO tiers (tier, tier_slug, tier_name, note, logo_url, active_status, added_org_id, created_uid, created_date, updated_date)
  VALUES('a614e04a-8127-11ed-a1eb-0242ac120002', 
    'silver',
    'Silver',
    'Silver Tier',
    'https://assets.epixelmlmsoftware.com/sites/all/themes/epixel_mlm/epixel-mlm-software-logo.svg',
    TRUE,
	'29be3f18-37db-11ed-95e6-578b37499fdd',
	'5342c632-398f-11ed-8adc-af8ba7a561bc',
	'2022-10-10 12:00:00',
	'2022-10-10 12:00:00');

INSERT INTO tiers (tier, tier_slug, tier_name, note, logo_url, active_status, added_org_id, created_uid, created_date, updated_date)
  VALUES('aea42cf2-8127-11ed-a1eb-0242ac120002',
    'gold',
    'Gold',
    'Gold Tier',
    'https://assets.epixelmlmsoftware.com/sites/all/themes/epixel_mlm/epixel-mlm-software-logo.svg',
    TRUE,
	'5860adba-37db-11ed-becb-d74a5fc227d4',
	'5ee2f5fc-398f-11ed-9c6c-db4f687550ad',
	'2022-10-10 12:00:00',
	'2022-10-10 12:00:00');

INSERT INTO role_permission (role, permission)
  VALUES('tenant-admin', 'loyalty:create-tier');

INSERT INTO role_permission (role, permission)
  VALUES('business-admin', 'loyalty:create-tier');

INSERT INTO role_permission (role, permission)
  VALUES('tenant-admin', 'loyalty:list-tiers');

INSERT INTO role_permission (role, permission)
  VALUES('business-admin', 'loyalty:list-tiers');