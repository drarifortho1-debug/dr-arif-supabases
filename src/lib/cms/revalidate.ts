import "server-only";

import { revalidatePath, updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cms/queries";

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Called after every admin mutation.
 *
 * Next.js 16 splits tag invalidation in two: `revalidateTag` is
 * stale-while-revalidate, while `updateTag` expires immediately. A CMS wants
 * the second one — after pressing Save the editor must see their own change on
 * the live site, not the previous version. `updateTag` is only valid inside a
 * Server Action, which is exactly where every admin mutation runs.
 */
export function revalidateContent(...tags: CacheTag[]) {
  for (const tag of tags) {
    updateTag(tag);
  }
  // Clears the rendered HTML for every locale of every route.
  revalidatePath("/", "layout");
}

export { CACHE_TAGS };
