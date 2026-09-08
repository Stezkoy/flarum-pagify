import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';

import goToPage from './goToPage';
import { postsPerPage, streamEnabled } from './config';

const PREFIX = 'stezkoy-pagify';

export default class PostPaginator extends Component {
  view() {
    const stream = this.attrs.stream;

    if (!streamEnabled()) return null;

    const perPage = postsPerPage();
    const total = stream.count();
    const pageCount = Math.max(1, Math.ceil(total / perPage));

    if (pageCount <= 1) return null;

    const current = Math.min(pageCount, Math.floor(stream.visibleStart / perPage) + 1);

    return (
      <nav className="PagifyPostPaginator" aria-label={this.transText('aria_label')}>
        <ul className="PagifyPostPaginator-items">
          <li>{this.navButton('fas fa-angle-double-left', 1, current === 1, 'first')}</li>
          <li>{this.navButton('fas fa-angle-left', current - 1, current === 1, 'previous')}</li>
          {this.pageList(current, pageCount).map((page) => (
            <li>
              <Button
                className={'Button PagifyPostPaginator-page' + (page === current ? ' PagifyPostPaginator-page--active' : '')}
                onclick={() => this.goto(page)}
              >
                {page}
              </Button>
            </li>
          ))}
          <li>{this.navButton('fas fa-angle-right', current + 1, current === pageCount, 'next')}</li>
          <li>{this.navButton('fas fa-angle-double-right', pageCount, current === pageCount, 'last')}</li>
        </ul>
      </nav>
    );
  }

  navButton(icon, page, disabled, key) {
    return Button.component({
      className: 'Button Button--icon PagifyPostPaginator-nav',
      icon,
      disabled,
      title: this.transText(key),
      'aria-label': this.transText(key),
      onclick: () => this.goto(page),
    });
  }

  transText(key) {
    return app.translator.trans(PREFIX + '.forum.post_stream.' + key, {}, true);
  }

  goto(page) {
    const stream = this.attrs.stream;
    const perPage = postsPerPage();
    const pageCount = Math.max(1, Math.ceil(stream.count() / perPage));
    const target = Math.min(Math.max(1, page), pageCount);

    if (target === Math.floor(stream.visibleStart / perPage) + 1) return;

    goToPage(stream, target, perPage);
  }

  pageList(current, total) {
    const edge = 3;
    const left = Math.max(1, current - edge);
    const right = Math.min(total, current + edge);
    const pages = [];
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  }
}