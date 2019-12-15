import { MigrationInterface, QueryRunner } from 'typeorm';

export class tree1576449267444 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS ltree;');
    await queryRunner.query(`
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
      `);

    await queryRunner.query(`
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
  VOLATILE;`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_tree_path ON tree;`);

    await queryRunner.query(`
  CREATE TRIGGER trigger_tree_path
  AFTER INSERT
  OR UPDATE OF id,
  parent_id ON tree
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_update_tree_path ();`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
