create table notifications (
    id bigserial primary key,
    data jsonb
);

create index ix_notifications_to on notifications (data -> 'to');

create table profiles (
    id text primary key,
    data jsonb
);

create index ix_match on profiles( data->'dob', data->'gender', data->'latestActive', data->'location');

create table accounts (
    id text primary key,
    oid text,
    data jsonb
);

create index ix_accounts_oid on accounts(oid);

create table relations (
    subject text,
    target text,
    type text,
    primary key (subject, target, type)
);

create table messages (
    id bigserial primary key,
    data jsonb
);

create index ix_notifications_to on notifications (data -> 'from', data -> 'to');
