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
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    color text NOT NULL,
    is_column boolean NOT NULL
)
CREATE TABLE public.task_label
(
    label_id integer NOT NULL references task(id),
    task_id integer NOT NULL references label(id),
    PRIMARY KEY (label_id, task_id)
)
