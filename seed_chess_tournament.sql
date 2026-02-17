-- seed_chess_tournament.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

TRUNCATE TABLE
    games,
    players,
    tournaments,
    skill_level,
    violations
RESTART IDENTITY CASCADE;

-- =========================
-- Skill Levels (PK = title)
-- =========================
-- Must match schema: title is PRIMARY KEY (no skill_level_id column)
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

-- =========================
-- Tournaments
-- =========================
INSERT INTO tournaments (tournament_id, name, start_date, end_date, location) VALUES
    (gen_random_uuid(), 'Chicago Spring Open', DATE '2026-04-05', DATE '2026-04-07', 'Chicago, IL'),
    (gen_random_uuid(), 'NYC Rapid Challenge', DATE '2026-05-10', DATE '2026-05-12', 'New York, NY'),
    (gen_random_uuid(), 'St. Louis Masters',  DATE '2026-06-15', DATE '2026-06-18', 'St. Louis, MO'),
    (gen_random_uuid(), 'Hartford Classic',   DATE '2026-07-22', DATE '2026-07-24', 'Hartford, CT');

-- =========================
-- Players
-- =========================
INSERT INTO players (player_id, first_name, last_name, rating) VALUES
    (gen_random_uuid(), 'Yurii',    'Koval',        2460),
    (gen_random_uuid(), 'Joseph',   'Wallace',      2235),
    (gen_random_uuid(), 'Hussnain', 'Saleem',       2380),
    (gen_random_uuid(), 'Ronald',   'Forte',        1930),
    (gen_random_uuid(), 'Wedad',    'Mourtada',     1885),
    (gen_random_uuid(), 'Eva',      'Patel',        1625),
    (gen_random_uuid(), 'Seth',     'Loyd',         2055),
    (gen_random_uuid(), 'Amit',     'Deshpande',    1770),
    (gen_random_uuid(), 'Navdeep',  'Natt',         1685),
    (gen_random_uuid(), 'Brian',    'Tokumoto',     1820),
    (gen_random_uuid(), 'Denis',    'Dudkin',       2320),
    (gen_random_uuid(), 'Ethan',    'Wilson',       1345),
    (gen_random_uuid(), 'Juan',     'Martinez',     1510),
    (gen_random_uuid(), 'Keene',    'Lu',            960),
    (gen_random_uuid(), 'Kevin',    'Wonder',       1185),
    (gen_random_uuid(), 'Leon',     'Zeltser',      1440),
    (gen_random_uuid(), 'Liam',     'O Neil',       1595),
    (gen_random_uuid(), 'Michael',  'Chen',         1715),
    (gen_random_uuid(), 'Nurul',    'Hussain',      1080),
    (gen_random_uuid(), 'Tega',     'Omarejedje',    920),
    (gen_random_uuid(), 'Ryan',     'Zimmerman',     705),
    (gen_random_uuid(), 'Kelvin',   'Green',         540);

-- =========================
-- Games (12 total)
-- =========================
INSERT INTO games (game_id, tournament_id, player_white_id, player_black_id, result, played_at) VALUES
    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'Chicago Spring Open' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Yurii' AND last_name = 'Koval' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Joseph' AND last_name = 'Wallace' LIMIT 1),
        'WHITE_WIN', TIMESTAMPTZ '2026-04-05 10:00:00-05'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'Chicago Spring Open' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Hussnain' AND last_name = 'Saleem' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Ronald' AND last_name = 'Forte' LIMIT 1),
        'BLACK_WIN', TIMESTAMPTZ '2026-04-05 15:00:00-05'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'Chicago Spring Open' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Wedad' AND last_name = 'Mourtada' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Eva' AND last_name = 'Patel' LIMIT 1),
        'DRAW',      TIMESTAMPTZ '2026-04-06 10:00:00-05'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'NYC Rapid Challenge' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Seth' AND last_name = 'Loyd' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Amit' AND last_name = 'Deshpande' LIMIT 1),
        'WHITE_WIN', TIMESTAMPTZ '2026-05-10 09:30:00-04'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'NYC Rapid Challenge' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Navdeep' AND last_name = 'Natt' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Brian' AND last_name = 'Tokumoto' LIMIT 1),
        'BLACK_WIN', TIMESTAMPTZ '2026-05-10 14:30:00-04'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'NYC Rapid Challenge' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Denis' AND last_name = 'Dudkin' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Ethan' AND last_name = 'Wilson' LIMIT 1),
        'DRAW',      TIMESTAMPTZ '2026-05-11 11:00:00-04'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'St. Louis Masters' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Juan' AND last_name = 'Martinez' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Keene' AND last_name = 'Lu' LIMIT 1),
        'WHITE_WIN', TIMESTAMPTZ '2026-06-15 10:00:00-05'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'St. Louis Masters' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Kevin' AND last_name = 'Wonder' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Leon' AND last_name = 'Zeltser' LIMIT 1),
        'BLACK_WIN', TIMESTAMPTZ '2026-06-16 10:00:00-05'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'St. Louis Masters' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Liam' AND last_name = 'O Neil' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Michael' AND last_name = 'Chen' LIMIT 1),
        'DRAW',      TIMESTAMPTZ '2026-06-17 13:00:00-05'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'Hartford Classic' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Nurul' AND last_name = 'Hussain' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Tega' AND last_name = 'Omarejedje' LIMIT 1),
        'WHITE_WIN', TIMESTAMPTZ '2026-07-22 09:00:00-04'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'Hartford Classic' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Ryan' AND last_name = 'Zimmerman' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Kelvin' AND last_name = 'Green' LIMIT 1),
        'BLACK_WIN', TIMESTAMPTZ '2026-07-22 14:00:00-04'),

    (gen_random_uuid(),
        (SELECT tournament_id FROM tournaments WHERE name = 'Hartford Classic' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Yurii' AND last_name = 'Koval' LIMIT 1),
        (SELECT player_id FROM players WHERE first_name = 'Hussnain' AND last_name = 'Saleem' LIMIT 1),
        'DRAW',      TIMESTAMPTZ '2026-07-23 11:00:00-04');

-- =========================
-- Violations (29 total, varied counts per player)
-- Each violation links to an existing game using a UNIQUE played_at timestamp.
-- =========================
INSERT INTO violations (violation_id, player_id, game_id, violation_type, violation_date, consequence) VALUES

    -- Game: 2026-04-05 10:00 (Yurii vs Joseph)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Yurii' AND last_name='Koval' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-04-05 10:00:00-05' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-04-05 10:18:00-05', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Joseph' AND last_name='Wallace' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-04-05 10:00:00-05' LIMIT 1),
        'Touch-Move Violation', TIMESTAMPTZ '2026-04-05 10:35:00-05', 'Warning issued'),

    -- Game: 2026-04-05 15:00 (Hussnain vs Ronald)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Ronald' AND last_name='Forte' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-04-05 15:00:00-05' LIMIT 1),
        'Clock Misuse', TIMESTAMPTZ '2026-04-05 15:22:00-05', 'Time adjustment'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Hussnain' AND last_name='Saleem' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-04-05 15:00:00-05' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-04-05 15:41:00-05', 'Warning issued'),

    -- Game: 2026-04-06 10:00 (Wedad vs Eva)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Wedad' AND last_name='Mourtada' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-04-06 10:00:00-05' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-04-06 10:12:00-05', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Eva' AND last_name='Patel' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-04-06 10:00:00-05' LIMIT 1),
        'Touch-Move Violation', TIMESTAMPTZ '2026-04-06 10:44:00-05', 'Warning issued'),

    -- Game: 2026-05-10 09:30 (Seth vs Amit)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Seth' AND last_name='Loyd' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-05-10 09:30:00-04' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-05-10 09:51:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Amit' AND last_name='Deshpande' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-05-10 09:30:00-04' LIMIT 1),
        'Distraction', TIMESTAMPTZ '2026-05-10 10:05:00-04', 'Warning issued'),

    -- Game: 2026-05-10 14:30 (Navdeep vs Brian)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Navdeep' AND last_name='Natt' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-05-10 14:30:00-04' LIMIT 1),
        'Time Forfeit', TIMESTAMPTZ '2026-05-10 14:45:00-04', 'Game declared loss'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Navdeep' AND last_name='Natt' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-05-10 14:30:00-04' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-05-10 14:12:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Brian' AND last_name='Tokumoto' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-05-10 14:30:00-04' LIMIT 1),
        'Touch-Move Violation', TIMESTAMPTZ '2026-05-10 14:33:00-04', 'Warning issued'),

    -- Game: 2026-05-11 11:00 (Denis vs Ethan)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Denis' AND last_name='Dudkin' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-05-11 11:00:00-04' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-05-11 11:27:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Ethan' AND last_name='Wilson' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-05-11 11:00:00-04' LIMIT 1),
        'Clock Misuse', TIMESTAMPTZ '2026-05-11 11:08:00-04', 'Time adjustment'),

    -- Game: 2026-06-15 10:00 (Juan vs Keene)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Juan' AND last_name='Martinez' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-06-15 10:00:00-05' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-06-15 10:19:00-05', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Keene' AND last_name='Lu' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-06-15 10:00:00-05' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-06-15 10:31:00-05', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Keene' AND last_name='Lu' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-06-15 10:00:00-05' LIMIT 1),
        'Distraction', TIMESTAMPTZ '2026-06-15 10:47:00-05', 'Warning issued'),

    -- Game: 2026-06-16 10:00 (Kevin vs Leon)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Kevin' AND last_name='Wonder' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-06-16 10:00:00-05' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-06-16 10:06:00-05', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Leon' AND last_name='Zeltser' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-06-16 10:00:00-05' LIMIT 1),
        'Touch-Move Violation', TIMESTAMPTZ '2026-06-16 10:40:00-05', 'Warning issued'),

    -- Game: 2026-06-17 13:00 (Liam vs Michael)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Liam' AND last_name='O Neil' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-06-17 13:00:00-05' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-06-17 13:17:00-05', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Michael' AND last_name='Chen' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-06-17 13:00:00-05' LIMIT 1),
        'Clock Misuse', TIMESTAMPTZ '2026-06-17 13:02:00-05', 'Time adjustment'),

    -- Game: 2026-07-22 09:00 (Nurul vs Tega)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Nurul' AND last_name='Hussain' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 09:00:00-04' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-07-22 09:15:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Nurul' AND last_name='Hussain' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 09:00:00-04' LIMIT 1),
        'Touch-Move Violation', TIMESTAMPTZ '2026-07-22 09:33:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Tega' AND last_name='Omarejedje' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 09:00:00-04' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-07-22 09:22:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Tega' AND last_name='Omarejedje' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 09:00:00-04' LIMIT 1),
        'Distraction', TIMESTAMPTZ '2026-07-22 09:41:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Tega' AND last_name='Omarejedje' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 09:00:00-04' LIMIT 1),
        'Clock Misuse', TIMESTAMPTZ '2026-07-22 09:48:00-04', 'Time adjustment'),

    -- Game: 2026-07-22 14:00 (Ryan vs Kelvin)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Ryan' AND last_name='Zimmerman' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 14:00:00-04' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-07-22 14:09:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Ryan' AND last_name='Zimmerman' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 14:00:00-04' LIMIT 1),
        'Distraction', TIMESTAMPTZ '2026-07-22 14:21:00-04', 'Warning issued'),

    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Kelvin' AND last_name='Green' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 14:00:00-04' LIMIT 1),
        'Illegal Move', TIMESTAMPTZ '2026-07-22 14:12:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Kelvin' AND last_name='Green' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 14:00:00-04' LIMIT 1),
        'Touch-Move Violation', TIMESTAMPTZ '2026-07-22 14:34:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Kelvin' AND last_name='Green' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-22 14:00:00-04' LIMIT 1),
        'Clock Misuse', TIMESTAMPTZ '2026-07-22 14:49:00-04', 'Time adjustment'),

    -- Game: 2026-07-23 11:00 (Yurii vs Hussnain)
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Yurii' AND last_name='Koval' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-23 11:00:00-04' LIMIT 1),
        'Distraction', TIMESTAMPTZ '2026-07-23 11:10:00-04', 'Warning issued'),
    (gen_random_uuid(),
        (SELECT player_id FROM players WHERE first_name='Hussnain' AND last_name='Saleem' LIMIT 1),
        (SELECT game_id FROM games WHERE played_at = TIMESTAMPTZ '2026-07-23 11:00:00-04' LIMIT 1),
        'Clock Misuse', TIMESTAMPTZ '2026-07-23 11:37:00-04', 'Time adjustment');

COMMIT;