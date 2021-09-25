CREATE TABLE public.activity
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    activity varchar (200) NOT NULL,
    feature1 varchar (200),
    datetime timestamp NOT NULL,
    CONSTRAINT activity_id PRIMARY KEY (id)
);