CREATE TABLE public.activity_hourly_rollup
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    activity varchar (200) NOT NULL,
    count integer NOT NULL,
    datetime timestamp NOT NULL,
    CONSTRAINT activity_hourly_rollup_id PRIMARY KEY (id),
    UNIQUE(datetime)
);