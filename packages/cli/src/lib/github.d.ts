/**
 * GitHub API client for fetching templates from the magicappdev/templates repo
 */
/** Template metadata from the remote repo */
export interface RemoteTemplate {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    frameworks: string[];
    version: string;
    author?: string;
    tags?: string[];
    files: string[];
}
/** Template index entry (lightweight listing) */
export interface TemplateIndexEntry {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    frameworks: string[];
    version: string;
}
/** Fetch the template index from GitHub */
export declare function fetchTemplateIndex(): Promise<TemplateIndexEntry[]>;
/** Fetch full template definition from GitHub */
export declare function fetchTemplate(id: string): Promise<RemoteTemplate>;
/** Fetch a single file from a template */
export declare function fetchTemplateFile(templateId: string, filePath: string): Promise<string>;
/** Get the cache directory for downloaded templates */
export declare function getTemplateCacheDir(): string;
/** Check if a template is already cached */
export declare function isTemplateCached(id: string): Promise<boolean>;
//# sourceMappingURL=github.d.ts.map