CREATE TABLE public.page_view
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    datetime timestamp NOT NULL,
    CONSTRAINT page_view_id PRIMARY KEY (id)
);