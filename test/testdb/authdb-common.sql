-- php: echo password_hash('mayIComeIn?',  PASSWORD_BCRYPT);
INSERT INTO loginmap (login, uid, enabled, passwd_method, passwd_hash)
  VALUES ('somebody@example.com', '5342c632-398f-11ed-8adc-af8ba7a561bc', true, 'bcrypt', '$2y$10$wa7PXjh4ZDjQL2GNc6q1fuEAi9C/FYUrqTsEt.bAetrF0HCoEHIPS');

INSERT INTO loginmap (login, uid, enabled, passwd_method, passwd_hash)
  VALUES ('inactive@example.com', '5ee2f5fc-398f-11ed-9c6c-db4f687550ad', false, 'bcrypt', '$2y$10$wa7PXjh4ZDjQL2GNc6q1fuEAi9C/FYUrqTsEt.bAetrF0HCoEHIPS');

INSERT INTO loginmap (login, uid, enabled, passwd_method, passwd_hash)
  VALUES ('invhash@example.com', '60633a68-398f-11ed-8378-8b40331d9b1d', true, 'nocrypt_bde5ee8e', '$2y$10$wa7PXjh4ZDjQL2GNc6q1fuEAi9C/FYUrqTsEt.bAetrF0HCoEHIPS');

INSERT INTO "user" (uid, fullname, email, email_verified_time) VALUES('5342c632-398f-11ed-8adc-af8ba7a561bc', 'ജോണ്‍ ഡോ', 'somebody@example.com', '2022-12-07T11:41:06+00:00');
INSERT INTO "user" (uid, fullname, email, email_verified_time) VALUES('5ee2f5fc-398f-11ed-9c6c-db4f687550ad', 'Inactive Person', 'inactive@example.com', '2022-12-07T11:42:06+00:00');
INSERT INTO "user" (uid, fullname, email, email_verified_time) VALUES('60633a68-398f-11ed-8378-8b40331d9b1d', 'InvalidHash Person', 'invhash@example.com', '2022-12-07T11:43:06+00:00');

INSERT INTO app (client_id, name, type, added_user, added_date, enabled, direct_login_allowed) VALUES(
  '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
  'myapp1',
  'webssr',
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  NOW(),
  true,
  true
);

-- mayIAccess?
INSERT INTO app_secret (client_id, client_secret_bcrypt) VALUES(
  '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
  '$2y$10$vTHbdt5aWinHIuntvOvGS.aOK.zMTdaZOF1LeWp//G04Lmv1P3WAu'
);

-- mayIRequest?
INSERT INTO app_secret (client_id, client_secret_bcrypt) VALUES(
  '5d588566-457f-11ed-a92d-e3fdbfbbeaa1',
  '$2y$10$Pdac0oRfStBxVEtdSTV8i.p2oDFKw8TYCBb/gsG2wnUVzl0VTsvwq'
);

INSERT INTO app (client_id, name, type, added_user, added_date, enabled, direct_login_allowed) VALUES(
  'db1cf7a4-45dc-11ed-a84c-03c92055383b',
  'myapp2',
  'webssr',
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  NOW(),
  true,
  false
);

-- mayIAccess?
INSERT INTO app_secret (client_id, client_secret_bcrypt) VALUES(
  'db1cf7a4-45dc-11ed-a84c-03c92055383b',
  '$2y$10$vTHbdt5aWinHIuntvOvGS.aOK.zMTdaZOF1LeWp//G04Lmv1P3WAu'
);

INSERT INTO app (client_id, name, type, added_user, added_date, enabled, direct_login_allowed) VALUES(
  'f0a2eb60-45dc-11ed-9d59-97d50e25f528',
  'myapp3',
  'webcsr',
  '5342c632-398f-11ed-8adc-af8ba7a561bc',
  NOW(),
  true,
  true
);

-- mayIAccess?
INSERT INTO app_secret (client_id, client_secret_bcrypt) VALUES(
  'f0a2eb60-45dc-11ed-9d59-97d50e25f528',
  '$2y$10$vTHbdt5aWinHIuntvOvGS.aOK.zMTdaZOF1LeWp//G04Lmv1P3WAu'
);
