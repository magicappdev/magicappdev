import { fetchTemplateIndex, fetchTemplate, fetchTemplateFile, getTemplateCacheDir, } from "../lib/github.js";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { success, error, info } from "../lib/ui.js";
import { existsSync } from "node:fs";
import { Command } from "commander";
import { join } from "node:path";
async function ensureDir(dir) {
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
}
/** List templates from remote registry */
async function listTemplates(options) {
    try {
        const templates = await fetchTemplateIndex();
        let filtered = templates;
        if (options.category) {
            filtered = filtered.filter(t => t.category === options.category);
        }
        if (options.framework) {
            filtered = filtered.filter(t => t.frameworks.includes(options.framework));
        }
        if (options.json) {
            console.log(JSON.stringify(filtered, null, 2));
            return;
        }
        if (filtered.length === 0) {
            info("No templates found matching your filters.");
            return;
        }
        console.log(`\nAvailable templates (${filtered.length}):\n`);
        for (const t of filtered) {
            console.log(`  ${t.slug.padEnd(20)} ${t.description}`);
            console.log(`  ${"".padEnd(20)} Category: ${t.category} | Frameworks: ${t.frameworks.join(", ")} | v${t.version}`);
            console.log();
        }
    }
    catch (err) {
        error(`Failed to list templates: ${err.message}`);
        process.exit(1);
    }
}
/** Show info about a specific template */
async function showTemplate(slug, options) {
    try {
        const template = await fetchTemplate(slug);
        if (options.json) {
            console.log(JSON.stringify(template, null, 2));
            return;
        }
        console.log(`\n  ${template.name}`);
        console.log(`  ${"─".repeat(template.name.length)}`);
        console.log(`  ${template.description}\n`);
        console.log(`  ID:          ${template.id}`);
        console.log(`  Slug:        ${template.slug}`);
        console.log(`  Category:    ${template.category}`);
        console.log(`  Frameworks:  ${template.frameworks.join(", ")}`);
        console.log(`  Version:     ${template.version}`);
        if (template.author)
            console.log(`  Author:      ${template.author}`);
        if (template.tags?.length)
            console.log(`  Tags:        ${template.tags.join(", ")}`);
        console.log(`  Files:       ${template.files.length} files`);
        console.log();
    }
    catch (err) {
        error(`Failed to fetch template "${slug}": ${err.message}`);
        process.exit(1);
    }
}
/** Download and cache a template */
async function downloadTemplate(slug) {
    const cacheDir = getTemplateCacheDir();
    const templateDir = join(cacheDir, slug);
    try {
        const template = await fetchTemplate(slug);
        await ensureDir(templateDir);
        // Write template.json
        await writeFile(join(templateDir, "template.json"), JSON.stringify(template, null, 2));
        // Download each file
        for (const filePath of template.files) {
            const content = await fetchTemplateFile(slug, filePath);
            const destPath = join(templateDir, filePath);
            await ensureDir(destPath.replace(/\/[^/]+$/, ""));
            await writeFile(destPath, content);
        }
        success(`Template "${template.name}" (v${template.version}) downloaded to ${templateDir}`);
        info(`Use: magicappdev init --template ${slug}`);
    }
    catch (err) {
        error(`Failed to download template "${slug}": ${err.message}`);
        process.exit(1);
    }
}
/** Sync local template index from remote */
async function syncTemplates() {
    const cacheDir = getTemplateCacheDir();
    const indexPath = join(cacheDir, "index.json");
    try {
        await ensureDir(cacheDir);
        const templates = await fetchTemplateIndex();
        await writeFile(indexPath, JSON.stringify(templates, null, 2));
        success(`Synced ${templates.length} templates from GitHub to ${cacheDir}`);
    }
    catch (err) {
        error(`Failed to sync templates: ${err.message}`);
        process.exit(1);
    }
}
/** Delete a cached template */
async function deleteTemplate(slug) {
    const cacheDir = getTemplateCacheDir();
    const templateDir = join(cacheDir, slug);
    if (!existsSync(templateDir)) {
        error(`Template "${slug}" is not cached. Run: magicappdev templates download ${slug}`);
        return;
    }
    const { rmSync } = await import("node:fs");
    rmSync(templateDir, { recursive: true, force: true });
    success(`Deleted cached template "${slug}"`);
}
/** Show cache status */
async function cacheStatus() {
    const cacheDir = getTemplateCacheDir();
    if (!existsSync(cacheDir)) {
        info("Template cache is empty. Run: magicappdev templates sync");
        return;
    }
    const { readdirSync } = await import("node:fs");
    const entries = readdirSync(cacheDir, { withFileTypes: true });
    const cached = entries.filter(e => e.isDirectory());
    console.log(`\nTemplate cache: ${cacheDir}`);
    console.log(`Cached templates: ${cached.length}\n`);
    for (const entry of cached) {
        const templateJson = join(cacheDir, entry.name, "template.json");
        if (existsSync(templateJson)) {
            const raw = await readFile(templateJson, "utf-8");
            const template = JSON.parse(raw);
            console.log(`  ${entry.name.padEnd(20)} v${template.version}`);
        }
        else {
            console.log(`  ${entry.name.padEnd(20)} (no metadata)`);
        }
    }
    console.log();
}
export const templatesCommand = new Command("templates")
    .description("Manage project templates from GitHub")
    .addHelpText("after", `
Subcommands:
  list                List available templates
  info <slug>         Show details for a specific template
  download <slug>     Download and cache a template locally
  sync                Sync template index from GitHub
  status              Show cache status
  delete <slug>       Delete a cached template

Examples:
  $ magicappdev templates list                    # List all templates
  $ magicappdev templates list -c app            # List only app templates
  $ magicappdev templates info blank-app         # Show template details
  $ magicappdev templates download blank-app     # Cache template locally
  $ magicappdev templates sync                   # Refresh template index
  $ magicappdev templates status                 # Show what's cached
  $ magicappdev templates delete blank-app       # Remove from cache
`)
    .command("list")
    .description("List available templates")
    .option("-c, --category <name>", "Filter by category (app, component, screen)")
    .option("-f, --framework <name>", "Filter by framework (next, react, react-native)")
    .option("--json", "Output as JSON")
    .action(listTemplates);
templatesCommand
    .command("info")
    .description("Show details for a specific template")
    .argument("<slug>", "Template slug (e.g. blank-app)")
    .option("--json", "Output as JSON")
    .action(showTemplate);
templatesCommand
    .command("download")
    .description("Download and cache a template locally")
    .argument("<slug>", "Template slug (e.g. blank-app)")
    .action(downloadTemplate);
templatesCommand
    .command("sync")
    .description("Sync template index from GitHub")
    .action(syncTemplates);
templatesCommand
    .command("status")
    .description("Show cache status")
    .action(cacheStatus);
templatesCommand
    .command("delete")
    .description("Delete a cached template")
    .argument("<slug>", "Template slug (e.g. blank-app)")
    .action(deleteTemplate);
