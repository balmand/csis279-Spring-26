CREATE TABLE public.feedback (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    rate INT NOT NULL CHECK (rate >= 0 AND rate <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
