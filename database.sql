CREATE TABLE public.task
(
    id SERIAL,
    title text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    due_date timestamp with time zone,
    is_done boolean
)
CREATE TABLE public.label
(
    id SERIAL,
    name text COLLATE pg_catalog."default",
    color text COLLSTE pg_catalog."default",
    iscolumn boolean
)
