import { extend, override } from 'flarum/common/extend';
import PostStream from 'flarum/forum/components/PostStream';

import goToPage from './goToPage';
import PostPaginator from './PostPaginator';
import { postsPerPage, streamEnabled, streamPosition } from './config';

/**
 * Apply pagination behaviour directly on the core PostStream prototype.
 *
 * ai_gen-core's DiscussionPage renders `<this.PostStream/>` inside a
 * PageStructure (there is no `mainContent` hook to swap the component), so we
 * patch the three methods that define the infinite-scroll behaviour on the
 * prototype instead — the approach flarum/realtime uses. All the rest of the
 * scroll lifecycle (ScrollListener, triggerScroll, scrollToItem, onscroll,
 * position tracking, read state) stays intact.
 *
 * - loadPostsIfNeeded -> no-op: scrolling never auto-loads an adjacent page.
 * - view -> strip the "Load more" item and render the pager above/under.
 * - oncreate -> snap the initial window to a single exact page (core loads a
 *   wider window around the deep-linked post, which would otherwise bleed the
 *   next page's posts onto this one).
 *
 * Every override falls back to the original when the feature is disabled.
 */
export default function patchPostStream() {
  override(PostStream.prototype, 'loadPostsIfNeeded', function (original, ...args) {
    if (!streamEnabled()) return original.apply(this, args);

    // no-op — pagination replaces infinite scroll.
  });

  override(PostStream.prototype, 'view', function (original, vnode) {
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

  extend(PostStream.prototype, 'oncreate', function (vnode) {
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