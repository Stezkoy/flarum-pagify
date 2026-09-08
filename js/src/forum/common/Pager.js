import app from 'flarum/forum/app';
import Button from 'flarum/common/components/Button';
import Component from 'flarum/common/Component';

const PREFIX = 'stezkoy-pagify';

export default class Pager extends Component {
  view() {
    const state = this.attrs.state;

    const pageSize = state.pageSize || this.fallbackPerPage();
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
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxLength={String(totalPages).length + 1}
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
              icon="fas fa-arrow-right"
              className="Button Button--icon"
              onclick={() => this.jump(state, this.element.querySelector('input')?.value)}
            />
          </li>
        </ul>
      </div>
    );
  }

  fallbackPerPage() {
    return typeof this.attrs.perPage === 'function' ? this.attrs.perPage() : 20;
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
    const pageSize = state.pageSize || this.fallbackPerPage();
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
    // This pager instance unmounts mid-request — resolve the list from the live DOM.
    setTimeout(() => {
      const list = document.querySelector(this.attrs.scrollSelector || '.DiscussionList')
        || document.querySelector('.Page-content');
      const header = document.getElementById('header');
      const offsetY = header ? header.clientHeight : 0;

      if (list) {
        const targetPosition = list.getBoundingClientRect().top + window.scrollY - offsetY - 100;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }, 50);
  }
}
