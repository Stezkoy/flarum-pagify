import { extend, override } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import PostStreamState from 'flarum/forum/states/PostStreamState';

import patchPostStream from './patchPostStream';
import { postsPerPage, streamEnabled } from './config';

export default function overrideDiscussionPage() {
  patchPostStream();

  override(DiscussionPage.prototype, 'oninit', function (original, vnode) {
    // Core v2 has no per-instance page size: PostStreamState.loadCount is the
    // static that loadNearIndex/loadIndex/loadPrevPage read to size the window,
    // so it must be set here. Assigning it from streamEnabled() in every
    // oninit also resets any stale value once pagination is switched off.
    PostStreamState.loadCount = streamEnabled() ? postsPerPage() : 20;
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
