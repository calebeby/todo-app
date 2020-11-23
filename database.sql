CREATE TABLE public.task
(
    id integer NOT NULL DEFAULT nextval('"task_ID_seq"'::regclass),
    title text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    duedate timestamp with time zone
)
