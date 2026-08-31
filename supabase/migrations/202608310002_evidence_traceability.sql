begin;
alter table public.analysis_evidence add column if not exists source_document text not null default '', add column if not exists source_page text not null default '', add column if not exists source_url text not null default '';
alter table public.analysis_evidence add constraint analysis_evidence_source_document_length check (length(source_document) <= 240), add constraint analysis_evidence_source_page_length check (length(source_page) <= 80), add constraint analysis_evidence_source_url_length check (length(source_url) <= 1000);
commit;
