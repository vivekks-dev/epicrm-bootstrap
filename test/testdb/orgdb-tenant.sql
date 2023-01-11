-- TODO FIXME duplication with sysdb
INSERT INTO organization (organization, type, name, parent)
  VALUES('29be3f18-37db-11ed-95e6-578b37499fdd',
         'tenant',
         'tenant1',
         NULL);

INSERT INTO organization (organization, type, name, parent)
  VALUES('c0f7cd1c-398a-11ed-84b8-b3fa364a6f03',
    'business_group',
    't1g1',
    '29be3f18-37db-11ed-95e6-578b37499fdd');

INSERT INTO organization (organization, type, name, parent)
  VALUES('feebc5ba-398a-11ed-a10e-1f765fffeb68',
    'business_group',
    't1g2',
    '29be3f18-37db-11ed-95e6-578b37499fdd');

INSERT INTO organization (organization, type, name, parent)
  VALUES('52f640b0-37db-11ed-86c5-b774bd35a6d1',
    'business',
    't1g1b1',
    'c0f7cd1c-398a-11ed-84b8-b3fa364a6f03');

INSERT INTO organization (organization, type, name, parent)
  VALUES('5860adba-37db-11ed-becb-d74a5fc227d4',
    'business',
    't1g1b2',
    'c0f7cd1c-398a-11ed-84b8-b3fa364a6f03');

INSERT INTO organization (organization, type, name, parent)
  VALUES('64d2031e-37db-11ed-984c-87c6bacd9172',
    'store',
    't1g1b1s1',
    '52f640b0-37db-11ed-86c5-b774bd35a6d1');

INSERT INTO organization (organization, type, name, parent)
  VALUES('903c6eea-37db-11ed-a976-bfbb4e5cabf8',
         'tenant',
         'tenant2',
         NULL);

INSERT INTO organization (organization, type, name, parent)
  VALUES('16223c32-398b-11ed-aa2a-9f6d5669bd4f',
    'business_group',
    't2g1',
    '903c6eea-37db-11ed-a976-bfbb4e5cabf8');

INSERT INTO organization (organization, type, name, parent)
  VALUES('a3adbb78-37db-11ed-a78f-c769b88e51c3',
    'business',
    't2g1b1',
    '16223c32-398b-11ed-aa2a-9f6d5669bd4f');

INSERT INTO organization (organization, type, name, parent)
  VALUES('f47cc620-37db-11ed-9519-d3724ff84ba2',
    'store',
    't2g1b1s1',
    'a3adbb78-37db-11ed-a78f-c769b88e51c3');

INSERT INTO organization_props (organization, key, locale, value)
  VALUES('29be3f18-37db-11ed-95e6-578b37499fdd', 'title', 'en', 'Tenant 1');
INSERT INTO organization_props (organization, key, locale, value)
  VALUES('29be3f18-37db-11ed-95e6-578b37499fdd', 'title', 'ml', 'ടെനന്റ് 1');
