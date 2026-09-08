import { extend, override } from 'flarum/common/extend';

import goToPage from './goToPage';
import PostPaginator from './PostPaginator';
import { postsPerPage, streamEnabled, streamPosition } from './config';

const POST_STREAM = 'flarum/forum/components/PostStream';

export default function patchPostStream() {
  override(POST_STREAM, 'loadPostsIfNeeded', function (original, ...args) {
    if (!streamEnabled()) return original(...args);
  });

  override(POST_STREAM, 'view', function (original, vnode) {
    const vdom = original(vnode);
    if (!streamEnabled() || !vdom || !Array.isArray(vdom.children)) return vdom;

    vdom.children = vdom.children.filter((child) => !(child && child.key === 'loadMore'));

    const position = streamPosition();
    const pager = (key) => (
      <div className="PagifyPostStream-pagination" key={key}>
        <PostPaginator stream={this.stream} />
      </div>
    );

    if (position === 'under' || position === 'both') {
      const replyIndex = vdom.children.findIndex((child) => child && child.key === 'reply');
      const bottom = pager('pagify-paginator-bottom');
      if (replyIndex >= 0) vdom.children.splice(replyIndex, 0, bottom);
      else vdom.children.push(bottom);
    }

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
    if (total <= perPage) return;

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

    if (s.visibleStart !== start || s.visibleEnd !== end) {
      goToPage(s, page, perPage, true, idx);
    }
  });
}
