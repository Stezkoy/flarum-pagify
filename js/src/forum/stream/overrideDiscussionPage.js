import { extend, override } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import PostStreamState from 'flarum/forum/states/PostStreamState';

import patchPostStream from './patchPostStream';
import { postsPerPage, streamEnabled } from './config';

/**
 * Turns the in-discussion post stream into a paginated one.
 *
 * Core's own show() / PostStream / page lifecycle is left untouched — we only
 * align the load window (loadCount), remove the scrubber (its continuous-scroll
 * model doesn't fit page navigation), show the real post number on each post,
 * and let patchPostStream swap in the pagination behaviour. Deep-links and
 * read-state keep using core's native post-number positioning, so
 * mention/flag "jump to post" links keep working.
 */
export default function overrideDiscussionPage() {
  patchPostStream();

  // Align core's post-load window with the page size BEFORE core's show creates
  // the stream, so the initial deep-link load fetches one page instead of the
  // default 20-post window. Safe here (app.forum exists at oninit) — unlike the
  // app initializer body, which runs before forum data is attached.
  override(DiscussionPage.prototype, 'oninit', function (original, vnode) {
    if (streamEnabled()) {
      PostStreamState.loadCount = postsPerPage();
    }
    return original(vnode);
  });

  // Show the real post number on each comment.
  extend(CommentPost.prototype, 'headerItems', function (items) {
    if (!streamEnabled()) return;
    const post = this.attrs.post;
    if (post.isHidden && post.isHidden()) return;
    items.add(
      'pagify-postnumber',
      <div className="PagifyPostNumber">
        <span>#</span>
        {post.number()}
      </div>,
      0
    );
  });

  // The scrubber's continuous-scroll model doesn't fit page navigation.
  extend(DiscussionPage.prototype, 'sidebarItems', function (items) {
    if (!streamEnabled()) return;
    if (items.has('scrubber')) items.remove('scrubber');
  });
}