import { override } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import classList from 'flarum/common/utils/classList';

import Pager from '../common/Pager';
import { postListEnabled, postListPerPage, postListPosition } from './config';

const POST_LIST = 'flarum/forum/components/PostList';
const POST_LIST_STATE = 'flarum/forum/states/PostListState';

/**
 * Turn the post lists (user profile activity feed, global posts page) into
 * numbered pages, mirroring the discussion-list behaviour.
 *
 * PostList, PostListItem and PostListState are lazy-loaded chunks in v2 (they
 * are absent from the main forum bundle), so every patch here goes through the
 * string-path form of override(), applied via flarum.reg.onLoad when the chunk
 * loads. The view is kept as core's own — we only constrain which pages the
 * state exposes, drop the "Load more" button, and add the pager.
 */
export default function overridePostList() {
  // Force the configured page size onto every request and the pager math.
  // Independent of the pagination toggle (like the discussion list's perPage):
  // with pagination off it sizes each "Load more" batch. Core's own loadPage
  // keeps its preload branch (meta.perPage), which wins on a preloaded first
  // page and keeps the math consistent either way.
  override(POST_LIST_STATE, 'loadPage', function (original, page) {
    this.pageSize = postListPerPage();

    return original(page);
  });

  // Expose only the current page — core's view then renders exactly one page
  // of PostListItems. Internal bookkeeping (pages[], hasNext, totals) reads
  // the state fields directly and stays untouched.
  override(POST_LIST_STATE, 'getPages', function (original) {
    if (!postListEnabled()) return original();

    const pageNum = this.getLocation().page || 1;

    return original().filter((page) => page.number === pageNum);
  });

  override(POST_LIST, 'view', function (original, vnode) {
    const state = this.attrs.state;
    if (!postListEnabled()) return original(vnode);

    // Mid page-switch the state is cleared: show a spinner instead of the
    // "empty" placeholder flashing in.
    if (state.isEmpty() && state.isLoading()) {
      return (
        <div className="PostList">
          <ul role="feed" aria-busy="true" className="PostList-discussions"></ul>
          <div className="PostList-loadMore">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    const vdom = original(vnode);
    if (!vdom || !Array.isArray(vdom.children)) return vdom;

    // Drop the "Load more" button — the numbered pager replaces it. The same
    // container holds the loading spinner, which stays while a page loads.
    vdom.children = vdom.children.filter((child) => {
      if (child && child.attrs && String(child.attrs.className || '').includes('PostList-loadMore')) {
        return state.isLoading();
      }
      return true;
    });

    const position = postListPosition();
    const pager = (key) => <Pager key={key} state={state} perPage={postListPerPage} scrollSelector=".PostList" />;

    // Bottom: right after the posts.
    if (position === 'under' || position === 'both') vdom.children.push(pager('pagify-postlist-pager-bottom'));

    // Top: above the first post.
    if (position === 'above' || position === 'both') vdom.children.unshift(pager('pagify-postlist-pager-top'));

    return vdom;
  });
}
