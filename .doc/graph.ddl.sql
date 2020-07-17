-- drop graph if exists capgraph cascade;
-- create graph capgraph;

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

create or replace function _tmp_create_graph_velement(i_json json) returns character varying as
$$
declare
  v_label character varying(50);
  v_props json;
  v_props_txt text;
  v_cid character varying(100);
  v_company_type character varying(100);
  v_existing_labels integer;
begin
  v_label := json_extract_path_text(i_json, 'labels', '0');
  if v_label not in ('Company', 'CompanyType') then
    raise 'Invalid vlabel name %', v_label;
  end if;

  v_props := json_extract_path(i_json, 'properties');
  v_props_txt := v_props::text;

  if v_label = 'Company' then
    v_cid := json_extract_path_text(v_props, 'cid');
	match (:company {cid: v_cid}) return count(*) into v_existing_labels;
	if v_existing_labels = 0 then
	  create
	end if;
  else
    v_company_type := json_extract_path_text(v_props, 'type');
	match (:company_type {type: v_company_type}) return count(*) into v_existing_labels;
	if v_existing_labels = 0 then
	end if;
  end if;
end;
$$ language 'plpgsql';

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
