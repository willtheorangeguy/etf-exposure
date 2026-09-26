import { cp, mkdir, access } from "node:fs/promises";

await access(".mkdocs-shared/shared/mkdocs.base.yml");
const shared = ".mkdocs-shared/design-system";
for (const folder of ["docs/stylesheets", "docs/javascript", "docs/images", "overrides/.icons"]) {
  await mkdir(folder, { recursive: true });
}
await cp(`${shared}/stylesheets`, "docs/stylesheets", { recursive: true, force: true });
await cp(`${shared}/javascript`, "docs/javascript", { recursive: true, force: true });
await cp(`${shared}/overrides`, "overrides", { recursive: true, force: false });
await cp(`${shared}/icons`, "overrides/.icons", { recursive: true, force: false });
await cp(`${shared}/images/favicon.svg`, "docs/images/favicon.svg", { force: false });
console.log("Shared documentation design system staged.");
