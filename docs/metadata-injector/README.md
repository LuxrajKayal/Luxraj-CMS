# Luxraj CMS — Metadata Injector Planning Artifacts

**Status:** Planning specification, not implementation approval. **Scope:** Task 15–19 and the 12 initially selected website categories. This folder preserves the detailed documents and JSON registries without duplicating them in the root README/roadmap.

## Canonical files

| Document | Purpose |
| --- | --- |
| [boilerplates-v3.md](./boilerplates-v3.md) | Consolidated hierarchy, 12 website categories, 294 copyable HTML boilerplates, page-type labels and explicit Schema.org/OG mappings |
| [boilerplates-v3.json](./boilerplates-v3.json) | Machine-readable category/page-type identity registry and exact manual snippets |
| [metadata-placeholder-research-v1.md](./metadata-placeholder-research-v1.md) | Detailed initial SEO placeholder research for each category/page type |
| [metadata-placeholder-refinement-v2.md](./metadata-placeholder-refinement-v2.md) | Required/conditional applicability, nested Schema.org relationships, evidence requirements and later SEO-validation policies |
| [data/metadata-v2/index.json](./data/metadata-v2/index.json) | **Current refined v2 JSON matrix**: shared profiles and 25 numbered JSON parts covering all 294 page-type records |

The refined v2 matrix is stored as **valid JSON shards** to keep the repository reviewable. The shared JSON contains all top-level catalogs, policies, profiles, category records and cross-references; the numbered part files preserve the complete `page_type_entries` array in order. The index contains exact part order, counts and the SHA-256 of the original single-file matrix. No schema fields or per-page definitions are dropped.

## Approved planning distinctions

- **Website Type → website category → Page Type → copy boilerplate** in the Metadata Injector's internal sidebar.
- The maintainer manually adds `data-cms-seo="true"`, `data-cms-website="<category>"` and `data-cms-seo-type="<type>"` to an existing opening `<html>` tag. **The CMS must never automatically add, infer, repair or overwrite those identifying attributes.**
- The 12 website categories were handpicked. **The 28 Blog & Publishing definitions are owner-selected; the remaining 266 are research candidates and require owner approval before implementation.**
- All category templates are independently owned after their initial Blog-derived copy. An edit to one category never silently modifies another.
- The scanner only inspects `.html`/`.htm` in the selected repository and branch. It uses the exact category + type pair to determine the applicable metadata profile. Unmarked/unknown pages do not become injectable.
- **Presence-only placeholder verification.** A `<title>` exists whether it is empty, populated or contains `{{SEO_TITLE}}`; therefore **skip** it. `meta[name="description"]` is distinct from `meta[property="og:description"]`. Inspect only the element's identifying structure, not `content`, `href`, text, or SEO quality. Detect expected Schema.org node/type/property identities, without judging their values or assuming an unrelated JSON-LD script satisfies them. Do not overwrite existing elements or introduce duplicates. Special cases for genuinely repeatable structures will be finalized during insertion design.
- After the scan, the owner may select files and edit **proposed missing placeholder code** (not existing tags, not the canonical template); save a Supabase draft; inspect the existing Monaco Source Control diff; explicitly confirm the branch-safe GitHub commit; then inspect the committed diff in Code Editor → Source Control → History.
- The approved Blog catalog of **11 core fields, 25 OG properties, six X/Twitter fields and S01–S40 Schema.org entries** is preserved. Each page gets applicable structures, not every available specialized entity.
- **Separate future SEO population/validation.** The v2 research describes which factual SEO properties will need to be supplied and checked later; it must not be mistaken for instructions to evaluate values during structure-only injection.

## Reconstructing the original single-file JSON matrix

From the repository root, this read-only Python snippet produces the exact JSON matrix v2 and checks its original SHA-256. It changes no CMS code, GitHub branch, or source repository.

```python
import hashlib
import json
from pathlib import Path

root = Path("docs/metadata-injector/data/metadata-v2")
manifest = json.loads((root / "index.json").read_text(encoding="utf-8"))
matrix = json.loads((root / manifest["shared"]["path"]).read_text(encoding="utf-8"))
entries = []

for part in manifest["parts"]:
    chunk = json.loads((root / part["path"]).read_text(encoding="utf-8"))
    entries.extend(chunk["page_type_entries"])

assert len(entries) == manifest["entry_count"] == 294
matrix["page_type_entries"] = entries
reconstructed = json.dumps(matrix, ensure_ascii=False, indent=2) + "\n"
assert hashlib.sha256(reconstructed.encode("utf-8")).hexdigest() == manifest["source_sha256"]

output = Path("Luxraj_CMS_Metadata_Placeholder_Matrix_v2_refined.json")
output.write_text(reconstructed, encoding="utf-8")
print("Verified:", output)
```

## Outstanding, intentionally unapproved technical details

Exact `{{PAGE_ID}}` meta element name, HTML placement order, repeatable metadata detection/merge mechanics, JSON-LD merge safety, partial-file default selection, scope of edits to proposed snippets, and later metadata population/validation UX are separate decisions. The matrix and boilerplates identify *what applies*; they do not authorize implementation or silently settle *how to insert it*.

Do not remove existing build workflows, alter live websites, change the finished Code Editor/Source Control features, or treat planning files as code/deployment approval.
