drop graph if exists capgraph cascade;
set graph_path=capgraph;

create vlabel company;
create vlabel company_type;

create elabel has_partner;
create elabel has_direct_invest inherits (has_partner);
create elabel has_strateg_alliance inherits (has_partner);
create elabel has_subsidiary inherits (has_partner);
create elabel has_supplier inherits (has_partner);

create elabel has_child;
