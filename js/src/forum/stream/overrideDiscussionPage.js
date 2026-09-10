import { extend, override } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import PostStreamState from 'flarum/forum/states/PostStreamState';

import patchPostStream from './patchPostStream';
import { postsPerPage, streamEnabled } from './config';

export default function overrideDiscussionPage() {
  patchPostStream();

  override(DiscussionPage.prototype, 'oninit', function (original, vnode) {
    // Core v2 still reads PostStreamState.loadCount (loadNearIndex/loadIndex
    // centre the initial window on it) — this sizes deep-link windows when the
    // paginated stream is active. goToPage() overrides the window explicitly,
    // so this mainly tunes the first non-paginated load.
    if (streamEnabled()) {
      PostStreamState.loadCount = postsPerPage();
    }
    return original(vnode);
  });

  extend(CommentPost.prototype, 'headerItems', function (items) {
    if (!streamEnabled()) return;
    const post = this.attrs.post;
    if (post.isHidden && post.isHidden()) return;
    items.add(
      'pagify-postnumber',
      <span className="PagifyPostNumber">
        <span>#</span>
        {post.number()}
      </span>,
      0
    );
  });

  extend(DiscussionPage.prototype, 'sidebarItems', function (items) {
    if (!streamEnabled()) return;
    if (items.has('scrubber')) items.remove('scrubber');
  });
}
