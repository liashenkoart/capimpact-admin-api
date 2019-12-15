CREATE TABLE tree (
  id integer PRIMARY KEY,
  name varchar,
  parent_id integer,
  path ltree
);

CREATE UNIQUE INDEX idx_tree_path_btree ON tree
USING btree (path);

CREATE INDEX idx_tree_path_gist ON tree
USING gist (path);

CREATE EXTENSION ltree;

CREATE OR REPLACE FUNCTION get_calculated_path (param_id integer)
  RETURNS ltree
  AS $$
  SELECT
    CASE WHEN parent_id IS NULL THEN
      id::text::ltree
    ELSE
      get_calculated_path (parent_id) || id::text
    END
  FROM
    tree
  WHERE
    id = $1;
$$
LANGUAGE sql;

CREATE OR REPLACE FUNCTION trigger_update_tree_path ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (COALESCE(OLD.parent_id, 0) != COALESCE(NEW.parent_id, 0) OR NEW.id != OLD.id) THEN
      -- update all nodes that are children of this one including this one
      UPDATE
        tree
      SET
        path = get_calculated_path (id)
      WHERE
        OLD.path @> tree.path;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE
      tree
    SET
      path = get_calculated_path (NEW.id)
    WHERE
      tree.id = NEW.id;
  END IF;
  RETURN NEW;
END
$$
LANGUAGE 'plpgsql'
VOLATILE;

CREATE OR REPLACE TRIGGER trigger_tree_path
  AFTER INSERT
  OR UPDATE OF id,
  parent_id ON tree
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_update_tree_path ();

INSERT INTO tree (id, parent_id, name)
  VALUES (1, NULL, 'Paper'), (2, 1, 'Recycled'), (3, 2, '20 lb'), (4, 2, '40 lb'), (5, 1, 'Non-Recycled'), (6, 5, '20 lb'), (7, 5, '40 lb'), (8, 5, 'Scraps');

