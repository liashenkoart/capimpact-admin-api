drop graph if exists capgraph cascade;

create graph capgraph;

set graph_path=capgraph;

create vlabel company;
create vlabel company_type;

create elabel has_partner;
create elabel has_direct_invest inherits (has_partner);
create elabel has_strateg_alliance inherits (has_partner);
create elabel has_subsidiary inherits (has_partner);
create elabel has_supplier inherits (has_partner);

create elabel has_child;

CREATE TABLE cap._tmp_import_company_graph
(
    cid character varying(100) NOT NULL,
    json_data json NOT NULL,
    imported boolean NOT NULL DEFAULT false,
    log text,
    last_import_date timestamp without time zone,
    PRIMARY KEY (cid)
)
WITH (
    OIDS = TRUE
);

ALTER TABLE cap._tmp_import_company_graph
    OWNER to agens;

create or replace function import_company_graph(i_cid character varying) returns character varying as
$$
declare
  v_json_graph json;
  v_json_start json;
  v_json_end json;
  v_json_rel json;
  v_log text;
  rec record;
begin
  v_log := '';
  for rec in (
    select json_array_elements(json_extract_path(json_array_elements(json_extract_path(p.js, '_fields')), 'segments')) json_graph
      from (
        	SELECT json_array_elements(g.json_data) js FROM cap._tmp_import_company_graph g where g.cid=i_cid
     ) p)
   loop
     v_json_graph := rec.json_graph;
	 v_json_start := json_extract_path(v_json_graph, 'start');
	 v_json_end := json_extract_path(v_json_graph, 'end');
	 v_json_rel := json_extract_path(v_json_graph, 'relationship');

	 /*
	 MERGE (E:person {name: 'Edward'})-[L:likes]->(A:person {name: 'Alice'});
	 */


   end loop;

  return v_log;
end;
$$ language 'plpgsql';
