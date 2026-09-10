import { override, extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import PostsUserPage from 'flarum/forum/components/PostsUserPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import classList from 'flarum/common/utils/classList';

import Pager from '../common/Pager';
import { postListEnabled, postListPerPage, postListPosition } from './config';
import { pagerMode, pagerWindow, pagerCounter, pagerJumpFeed, pagerScrollOffset, pagerButtonSize, pagerIcons, mobileCompact, mobileSmall, mobileButtonSize, mobileHideJump, mobileHideCounter, pagerTrans, urlPage, readPageParam, setActiveList } from '../common/config';

const POST_LIST = 'flarum/forum/components/PostList';
const POST_LIST_STATE = 'flarum/forum/states/PostListState';

export default function overridePostList() {
  override(POST_LIST_STATE, 'loadPage', function (original, page) {
    this.pageSize = postListPerPage();

    return original(page);
  });

  override(POST_LIST_STATE, 'getPages', function (original) {
    if (!postListEnabled()) return original();

    const pageNum = this.getLocation().page || 1;

    return original().filter((page) => page.number === pageNum);
  });

  override(POST_LIST, 'view', function (original, vnode) {
    const state = this.attrs.state;
    if (!postListEnabled()) return original(vnode);

    setActiveList({ state, scrollSelector: '.PostList', scrollOffset: pagerScrollOffset() });

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

    vdom.children = vdom.children.filter((child) => {
      if (child && child.attrs && String(child.attrs.className || '').includes('PostList-loadMore')) {
        return state.isLoading();
      }
      return true;
    });

    const position = postListPosition();
const pager = (key) => <Pager key={key} state={state} perPage={postListPerPage} scrollSelector=".PostList"
      trans={pagerTrans} mode={pagerMode()} window={pagerWindow()} counter={pagerCounter()} jump={pagerJumpFeed()}
      scrollOffset={pagerScrollOffset()} buttonSize={pagerButtonSize()} icons={pagerIcons()}
      mobileCompact={mobileCompact()} mobileSmall={mobileSmall()}
      mobileButtonSize={mobileButtonSize()}
      mobileHideJump={mobileHideJump()} mobileHideCounter={mobileHideCounter()} />;
    if (position === 'under' || position === 'both') vdom.children.push(pager('pagify-postlist-pager-bottom'));
    if (position === 'above' || position === 'both') vdom.children.unshift(pager('pagify-postlist-pager-top'));

    return vdom;
  });

  extend('flarum/forum/components/PostList', 'onremove', function () {
    if (urlPage()) setActiveList(null);
  });

  // Deep links like /u/name/posts?page=3 — core ignores the param here.
  extend(PostsUserPage.prototype, 'show', function (value, user) {
    if (!urlPage()) return;

    const page = readPageParam();

    if (page > 1) this.posts.refresh(page);
  });
}
