import { override } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import classList from 'flarum/common/utils/classList';

import Pager from '../common/Pager';
import { postListEnabled, postListPerPage, postListPosition } from './config';
import { pagerMode, pagerWindow, pagerCounter, pagerJumpFeed, pagerScrollOffset, pagerIcons, mobileCompact, mobileSmall, mobileHideJump, mobileHideCounter, pagerTrans } from '../common/config';

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
      scrollOffset={pagerScrollOffset()} icons={pagerIcons()}
      mobileCompact={mobileCompact()} mobileSmall={mobileSmall()}
      mobileHideJump={mobileHideJump()} mobileHideCounter={mobileHideCounter()} />;
    if (position === 'under' || position === 'both') vdom.children.push(pager('pagify-postlist-pager-bottom'));
    if (position === 'above' || position === 'both') vdom.children.unshift(pager('pagify-postlist-pager-top'));

    return vdom;
  });
}
