import { extend, override } from 'flarum/common/extend';

import goToPage from './goToPage';
import PostPaginator from './PostPaginator';
import { postsPerPage, streamEnabled, streamPosition } from './config';

const POST_STREAM = 'flarum/forum/components/PostStream';

/**
 * Apply pagination behaviour directly on the core PostStream prototype.
 *
 * The core loads PostStream lazily (a separate webpack chunk), so a static
 * `import PostStream from 'flarum/forum/components/PostStream'` would be
 * `undefined` at boot. Passing the module string to `override`/`extend` instead
 * registers the patches through `flarum.reg.onLoad`: they are applied to the
 * class as soon as the PostStream chunk is loaded, before any instance is
 * created (the chunk completes before DiscussionPage's `.then()` renders it).
 *
 * The three patched methods define the infinite-scroll behaviour:
 *
 * - loadPostsIfNeeded -> no-op: scrolling never auto-loads an adjacent page.
 * - view -> strip the "Load more" item and render the pager above/under.
 * - oncreate -> snap the initial window to a single exact page (core loads a
 *   wider window around the deep-linked post, which would otherwise bleed the
 *   next page's posts onto this one).
 *
 * All the rest of the scroll lifecycle (ScrollListener, triggerScroll,
 * scrollToItem, onscroll, position tracking, read state) stays intact. Every
 * patch falls back to the original when the feature is disabled.
 */
export default function patchPostStream() {
  override(POST_STREAM, 'loadPostsIfNeeded', function (original, ...args) {
    if (!streamEnabled()) return original(...args);

    // no-op — pagination replaces infinite scroll.
  });

  override(POST_STREAM, 'view', function (original, vnode) {
    const vdom = original(vnode);
    if (!streamEnabled() || !vdom || !Array.isArray(vdom.children)) return vdom;

    // Drop the core "Load more" button — it has no place in paginated mode.
    vdom.children = vdom.children.filter((child) => !(child && child.key === 'loadMore'));

    const position = streamPosition();
    const pager = (key) => (
      <div className="PagifyPostStream-pagination" key={key}>
        <PostPaginator stream={this.stream} />
      </div>
    );

    // Bottom: right after the posts (before the reply placeholder when shown).
    if (position === 'under' || position === 'both') {
      const replyIndex = vdom.children.findIndex((child) => child && child.key === 'reply');
      const bottom = pager('pagify-paginator-bottom');
      if (replyIndex >= 0) vdom.children.splice(replyIndex, 0, bottom);
      else vdom.children.push(bottom);
    }

    // Top: above the first post.
    if (position === 'above' || position === 'both') {
      vdom.children.unshift(pager('pagify-paginator-top'));
    }

    return vdom;
  });

  extend(POST_STREAM, 'oncreate', function (_value, vnode) {
    if (!streamEnabled() || this._pagifySnapped) return;
    this._pagifySnapped = true;

    const s = this.stream;
    const perPage = postsPerPage();
    const total = s.count();
    if (total <= perPage) return; // single page — nothing to constrain

    // Which post index did core position us on? Prefer the target post's real
    // index; fall back to the (centred) window start.
    let idx = s.visibleStart;
    const tp = s.targetPost;
    if (tp && typeof tp.number === 'number') {
      const post = s.posts().find((p) => p && p.number() === tp.number);
      if (post) {
        const at = this.discussion.postIds().indexOf(post.id());
        if (at >= 0) idx = at;
      }
    } else if (tp && typeof tp.index === 'number') {
      idx = tp.index;
    }

    const page = Math.floor(idx / perPage) + 1;
    const start = (page - 1) * perPage;
    const end = Math.min(start + perPage, total);

    // Only snap if core's window isn't already exactly this page.
    if (s.visibleStart !== start || s.visibleEnd !== end) {
      goToPage(s, page, perPage, true, idx);
    }
  });
}