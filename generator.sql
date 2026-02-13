-- seed_chess_tournament.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

TRUNCATE TABLE
    games,
    players,
    tournaments,
    skill_level
RESTART IDENTITY CASCADE;

-- USCF rating categories
INSERT INTO skill_level (title, rating_lower_bound, rating_upper_bound) VALUES
    ('Senior Master', 2400, 9999),
    ('National Master', 2200, 2399),
    ('Expert', 2000, 2199),
    ('Class A', 1800, 1999),
    ('Class B', 1600, 1799),
    ('Class C', 1400, 1599),
    ('Class D', 1200, 1399),
    ('Class E', 1000, 1199),
    ('Class F', 800, 999),
    ('Class G', 600, 799),
    ('Class H', 400, 599),
    ('Class I', 200, 399),
    ('Class J', 100, 199);

-- Tournaments (UUIDs generated at insert time)
INSERT INTO tournaments (tournament_id, name, start_date, end_date, location) VALUES
    (gen_random_uuid(), 'Chicago Spring Open', DATE '2026-04-05', DATE '2026-04-07', 'Chicago, IL'),
    (gen_random_uuid(), 'NYC Rapid Challenge', DATE '2026-05-10', DATE '2026-05-12', 'New York, NY'),
    (gen_random_uuid(), 'St. Louis Masters', DATE '2026-06-15', DATE '2026-06-18', 'St. Louis, MO'),
    (gen_random_uuid(), 'Hartford Classic', DATE '2026-07-22', DATE '2026-07-24', 'Hartford, CT');

-- Manual games per tournament
INSERT INTO games (game_id, tournament_id, result, played_at) VALUES
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'Chicago Spring Open' LIMIT 1), 'WHITE_WIN', TIMESTAMPTZ '2026-04-05 10:00:00-05'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'Chicago Spring Open' LIMIT 1), 'BLACK_WIN', TIMESTAMPTZ '2026-04-05 15:00:00-05'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'Chicago Spring Open' LIMIT 1), 'DRAW',      TIMESTAMPTZ '2026-04-06 10:00:00-05'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'NYC Rapid Challenge' LIMIT 1), 'WHITE_WIN', TIMESTAMPTZ '2026-05-10 09:30:00-04'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'NYC Rapid Challenge' LIMIT 1), 'BLACK_WIN', TIMESTAMPTZ '2026-05-10 14:30:00-04'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'NYC Rapid Challenge' LIMIT 1), 'DRAW',      TIMESTAMPTZ '2026-05-11 11:00:00-04'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'St. Louis Masters' LIMIT 1), 'WHITE_WIN', TIMESTAMPTZ '2026-06-15 10:00:00-05'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'St. Louis Masters' LIMIT 1), 'BLACK_WIN', TIMESTAMPTZ '2026-06-16 10:00:00-05'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'St. Louis Masters' LIMIT 1), 'DRAW',      TIMESTAMPTZ '2026-06-17 13:00:00-05'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'Hartford Classic' LIMIT 1), 'WHITE_WIN', TIMESTAMPTZ '2026-07-22 09:00:00-04'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'Hartford Classic' LIMIT 1), 'BLACK_WIN', TIMESTAMPTZ '2026-07-22 14:00:00-04'),
    (gen_random_uuid(), (SELECT tournament_id FROM tournaments WHERE name = 'Hartford Classic' LIMIT 1), 'DRAW',      TIMESTAMPTZ '2026-07-23 11:00:00-04');

-- Player roster with ratings that fit USCF bands
INSERT INTO players (first_name, last_name, rating) VALUES
    ('Yurii',   'Koval',        2460),
    ('Joseph',  'Wallace',      2235),
    ('Hussnain','Saleem',       2380),
    ('Ronald',  'Forte',        1930),
    ('Wedad',   'Mourtada',     1885),
    ('Eva',     'Patel',        1625),
    ('Seth',    'Loyd',         2055),
    ('Amit',    'Deshpande',    1770),
    ('Navdeep', 'Natt',         1685),
    ('Brian',   'Tokumoto',     1820),
    ('Denis',   'Dudkin',       2320),
    ('Ethan',   'Wilson',       1345),
    ('Juan',    'Martinez',     1510),
    ('Keene',   'Lu',            960),
    ('Kevin',   'Wonder',       1185),
    ('Leon',    'Zeltser',      1440),
    ('Liam',    'O Neil',       1595),
    ('Michael', 'Chen',         1715),
    ('Nurul',   'Hussain',      1080),
    ('Tega',    'Omarejedje',    920),
    ('Ryan',    'Zimmerman',     705),
    ('Kelvin',  'Green',         540);

COMMIT;
