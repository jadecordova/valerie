BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "movie_stars" (
	"movie_id"	INTEGER,
	"star_id"	INTEGER,
	PRIMARY KEY("movie_id","star_id"),
	FOREIGN KEY("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE,
	FOREIGN KEY("star_id") REFERENCES "stars"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "movie_tags" (
	"movie_id"	INTEGER,
	"tag_id"	INTEGER,
	PRIMARY KEY("movie_id","tag_id"),
	FOREIGN KEY("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE,
	FOREIGN KEY("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "movies" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL DEFAULT ' ',
	"score"	INTEGER NOT NULL DEFAULT 0,
	"container"	TEXT,
	"disk"	TEXT,
	"special"	TEXT NOT NULL DEFAULT 0,
	"size"	TEXT NOT NULL,
	"width"	INTEGER,
	"height"	INTEGER,
	"duration"	TEXT,
	"codec"	TEXT,
	"fps"	INTEGER,
	"extension"	TEXT NOT NULL DEFAULT 'mp4',
	"edited"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "stars" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"score"	INTEGER NOT NULL DEFAULT 0,
	"movies"	INTEGER NOT NULL DEFAULT 0,
	"special"	INTEGER NOT NULL DEFAULT 0,
	"edited"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "tags" (
	"id"	INTEGER NOT NULL UNIQUE,
	"tag"	TEXT NOT NULL,
	"score"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TRIGGER decrement_star_movie_count
AFTER DELETE ON movie_stars
FOR EACH ROW
BEGIN
    UPDATE stars
    SET movies = movies - 1
    WHERE id = OLD.star_id;
END;
CREATE TRIGGER increment_star_movie_count
AFTER INSERT ON movie_stars
FOR EACH ROW
BEGIN
    UPDATE stars
    SET movies = movies + 1
    WHERE id = NEW.star_id;
END;
COMMIT;
