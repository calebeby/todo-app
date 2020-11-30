CREATE TABLE public.task
(
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    description text,
    due_date timestamp with time zone,
    is_done boolean NOT NULL,
)

CREATE TABLE public."user"
(
    id SERIAL PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
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
