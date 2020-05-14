create table notifications (
    id bigserial primary key,
    data jsonb
);

create table profiles (
    id text primary key,
    data jsonb
);

create table accounts (
    id text primary key,
    data jsonb
);

create table relations (
    subject text,
    target text,
    type text
);

create table messages (
    id bigserial primary key,
    data jsonb
);
