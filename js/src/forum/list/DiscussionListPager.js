import app from 'flarum/forum/app';
import Button from 'flarum/common/components/Button';
import Component from 'flarum/common/Component';

import { perPage } from './config';

const PREFIX = 'stezkoy-pagify';

/**
 * The numbered pager for the discussion list, driven by the core v2
 * PaginatedListState (totalItems / pageSize / goto). Page clicks swap the
 * loaded page via state.goto(), like the stock "Load more" would have.
 */
export default class DiscussionListPager extends Component {
  view() {
    const state = this.attrs.state;

    const pageSize = state.pageSize || perPage();
    const total = state.totalItems ?? this.payloadTotal(state) ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(totalPages, state.getLocation().page || 1);

    return (
      <div className="PagifyPager">
        <ul className="PagifyPager-list">
          <li>
            <Button
              title={app.translator.trans(PREFIX + '.forum.list.first')}
              icon="fas fa-angle-double-left"
              className="Button Button--icon"
              onclick={() => this.goto(state, 1)}
              disabled={current === 1}
            />
          </li>
          <li>
            <Button
              title={app.translator.trans(PREFIX + '.forum.list.previous')}
              icon="fas fa-angle-left"
              className="Button Button--icon"
              onclick={() => this.goto(state, current - 1)}
              disabled={current === 1}
            />
          </li>
          {this.pageList(current, totalPages).map((page) => {
            return (
              <li>
                <Button
                  title={String(page)}
                  className={page === current ? 'Button Button--primary Button--active' : 'Button'}
                  onclick={() => this.goto(state, page)}
                >
                  {page}
                </Button>
              </li>
            );
          })}
          <li>
            <Button
              title={app.translator.trans(PREFIX + '.forum.list.next')}
              icon="fas fa-angle-right"
              className="Button Button--icon"
              onclick={() => this.goto(state, current + 1)}
              disabled={current === totalPages}
            />
          </li>
          <li>
            <Button
              title={app.translator.trans(PREFIX + '.forum.list.last')}
              icon="fas fa-angle-double-right"
              className="Button Button--icon"
              onclick={() => this.goto(state, totalPages)}
              disabled={current === totalPages}
            />
          </li>
          <li className="PagifyPager-jump">
            <input
              className="FormControl"
              type="number"
              min={1}
              max={totalPages}
              placeholder={String(current)}
              aria-label={app.translator.trans(PREFIX + '.forum.list.jump')}
              title={app.translator.trans(PREFIX + '.forum.list.jump')}
              onkeydown={(event) => {
                if (event.key === 'Enter') {
                  event.redraw = false;
                  this.jump(state, event.target.value);
                }
              }}
            />
          </li>
          <li>
            <Button
              title={app.translator.trans(PREFIX + '.forum.list.jump')}
              icon="fas fa-paper-plane"
              className="Button Button--icon"
              onclick={() => this.jump(state, this.element.querySelector('input')?.value)}
            />
          </li>
        </ul>
      </div>
    );
  }

  payloadTotal(state) {
    const firstPage = state.getPages()[0];
    const meta = firstPage && firstPage.items && firstPage.items.payload ? firstPage.items.payload.meta : null;
    const total = meta && meta.page ? meta.page.total : null;

    return total != null ? parseInt(total, 10) : null;
  }

  pageList(current, totalPages) {
    const edge = 3;
    const pages = [];
    const left = Math.max(1, current - edge);
    const right = Math.min(totalPages, current + edge);

    for (let i = left; i <= right; i++) pages.push(i);

    return pages;
  }

  goto(state, page) {
    const pageSize = state.pageSize || perPage();
    const total = state.totalItems ?? this.payloadTotal(state) ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const target = Math.min(Math.max(1, page), totalPages);

    if (target === (state.getLocation().page || 1)) return;

    state.goto(target).then(() => this.scrollToTop());
  }

  jump(state, rawValue) {
    const value = parseInt(rawValue, 10);
    if (!Number.isFinite(value) || !Number.isSafeInteger(value)) return;

    this.goto(state, value);
  }

  scrollToTop() {
    const container = document.querySelector('#content > .IndexPage > .container');
    const header = document.getElementById('header');
    const offsetY = header ? header.clientHeight : 0;

    if (container) {
      const targetPosition = container.getBoundingClientRect().top + window.scrollY - offsetY;
      setTimeout(() => window.scrollTo({ top: targetPosition, behavior: 'smooth' }), 50);
    }
  }
}