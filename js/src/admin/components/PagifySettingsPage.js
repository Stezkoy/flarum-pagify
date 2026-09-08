import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Switch from 'flarum/common/components/Switch';

const PREFIX = 'stezkoy-pagify';

export default class PagifySettingsPage extends ExtensionPage {
  content() {
    return m('.ExtensionPage-settings', m('.container', [
      m('.PagifySettings', [
        this._discussionListSection(),
        this._postStreamSection(),
        this._postListSection(),
        m('.Form-group.Form-controls', this.submitButton()),
      ]),
    ]));
  }

  _discussionListSection() {
    return this._section('admin.settings.discussion_list_heading', [
      this._toggle(
        PREFIX + '.enableDiscussionList',
        'admin.settings.enableDiscussionList',
        'admin.settings.enableDiscussionList-Help'
      ),
      this._positionField(PREFIX + '.paginationPosition', 'admin.settings.paginationPosition'),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.perPage')),
        m('input.FormControl', {
          type: 'number',
          min: 1,
          max: 50,
          bidi: this.setting(PREFIX + '.perPage'),
        }),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.perPage-Help')),
      ]),
    ]);
  }

  _postStreamSection() {
    const streamEnabled = this._flagOn(PREFIX + '.enablePostStream');
    return this._section('admin.settings.post_stream_heading', [
      this._toggle(
        PREFIX + '.enablePostStream',
        'admin.settings.enablePostStream',
        'admin.settings.enablePostStream-Help'
      ),
      // Always available — it only matters when the toggle is on, but there is
      // no reason to freeze it.
      this._positionField(PREFIX + '.postStreamPosition', 'admin.settings.postStreamPosition'),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.postsPerPage')),
        m('input.FormControl', {
          type: 'number',
          min: 1,
          max: 50,
          disabled: !streamEnabled,
          bidi: this.setting(PREFIX + '.postsPerPage'),
        }),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.postsPerPage-Help')),
      ]),
    ]);
  }

  _postListSection() {
    return this._section('admin.settings.post_list_heading', [
      this._toggle(
        PREFIX + '.enablePostList',
        'admin.settings.enablePostList',
        'admin.settings.enablePostList-Help'
      ),
      this._positionField(PREFIX + '.postListPosition', 'admin.settings.postListPosition'),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.postListPerPage')),
        m('input.FormControl', {
          type: 'number',
          min: 1,
          max: 50,
          bidi: this.setting(PREFIX + '.postListPerPage'),
        }),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.postListPerPage-Help')),
      ]),
    ]);
  }

  _positionField(key, labelKey, disabled = false) {
    return m('.Form-group', [
      m('label', app.translator.trans(PREFIX + '.' + labelKey)),
      m('select.FormControl', {
        disabled,
        value: this.setting(key)(),
        onchange: (e) => this.setting(key)(e.target.value),
      }, [
        m('option', { value: 'above' }, app.translator.trans(PREFIX + '.admin.settings.position.above')),
        m('option', { value: 'under' }, app.translator.trans(PREFIX + '.admin.settings.position.under')),
        m('option', { value: 'both' }, app.translator.trans(PREFIX + '.admin.settings.position.both')),
      ]),
    ]);
  }

  _section(titleKey, children) {
    return m('.PagifySettings-section', [
      m('h3', app.translator.trans(PREFIX + '.' + titleKey)),
      m('.PagifySettings-sectionBody', children),
    ]);
  }

  // Toggle switches store '1', but the backend defaults (Extend\Settings->default)
  // arrive as booleans until the settings are saved once — accept both.
  _flagOn(key) {
    const value = this.setting(key, '')();
    return value === '1' || value === true || value === 1;
  }

  _toggle(key, labelKey, descKey) {
    return m('.Form-group', [
      m(
        Switch,
        {
          state: this._flagOn(key),
          onchange: (value) => {
            this.setting(key)(value ? '1' : '');
            m.redraw();
          },
        },
        app.translator.trans(PREFIX + '.' + labelKey)
      ),
      m('p.helpText', app.translator.trans(PREFIX + '.' + descKey)),
    ]);
  }
}