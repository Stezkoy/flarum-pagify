import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Switch from 'flarum/common/components/Switch';
import Button from 'flarum/common/components/Button';

import Pager, { PAGER_ICON_DEFAULTS } from '../../forum/common/Pager';

const PREFIX = 'stezkoy-pagify';

// The admin locale bundle only carries admin.* keys — mirror the forum pager
// strings used by the live preview.
const MIRRORED_PREVIEW_KEYS = {
  'forum.list.pageOf': 'admin.settings.pageOfText',
  'forum.list.pageInput': 'admin.settings.pageInputText',
  'forum.list.aria_label': 'admin.settings.pagerAriaLabel',
  'forum.list.first': 'admin.settings.pagerLabelFirst',
  'forum.list.previous': 'admin.settings.pagerLabelPrev',
  'forum.list.next': 'admin.settings.pagerLabelNext',
  'forum.list.last': 'admin.settings.pagerLabelLast',
  'forum.list.jump': 'admin.settings.pagerLabelJump',
};

export default class PagifySettingsPage extends ExtensionPage {
  content() {
    return m('.ExtensionPage-settings', m('.container', [
      m('.PagifySettings', [
        this._discussionListSection(),
        this._postStreamSection(),
        this._postListSection(),
        this._pagerSection(),
        this._mobileSection(),
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

  _pagerSection() {
    return this._section('admin.settings.pager_heading', [
      this._toggle(PREFIX + '.urlPage', 'admin.settings.urlPage', 'admin.settings.urlPage-Help'),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.pagerMode')),
        m('select.FormControl', {
          value: this.setting(PREFIX + '.pagerMode')(),
          onchange: (e) => {
            this.setting(PREFIX + '.pagerMode')(e.target.value);
            m.redraw();
          },
        }, [
          m('option', { value: 'full' }, app.translator.trans(PREFIX + '.admin.settings.pager_mode_full')),
          m('option', { value: 'compact' }, app.translator.trans(PREFIX + '.admin.settings.pager_mode_compact')),
          m('option', { value: 'core' }, app.translator.trans(PREFIX + '.admin.settings.pager_mode_core')),
          m('option', { value: 'mini' }, app.translator.trans(PREFIX + '.admin.settings.pager_mode_mini')),
        ]),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.pagerMode-Help')),
      ]),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.pagerWindow')),
        m('input.FormControl', {
          type: 'number',
          min: 1,
          max: 10,
          bidi: this.setting(PREFIX + '.pagerWindow'),
        }),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.pagerWindow-Help')),
      ]),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.pagerButtonSize')),
        m('input.FormControl', {
          type: 'number',
          min: 24,
          max: 72,
          bidi: this.setting(PREFIX + '.pagerButtonSize'),
        }),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.pagerButtonSize-Help')),
      ]),
      this._toggle(PREFIX + '.pagerCounter', 'admin.settings.pagerCounter', 'admin.settings.pagerCounter-Help'),
      this._toggle(PREFIX + '.pagerJumpList', 'admin.settings.pagerJumpList', 'admin.settings.pagerJumpList-Help'),
      this._toggle(PREFIX + '.pagerJumpStream', 'admin.settings.pagerJumpStream', 'admin.settings.pagerJumpStream-Help'),
      this._toggle(PREFIX + '.pagerJumpFeed', 'admin.settings.pagerJumpFeed', 'admin.settings.pagerJumpFeed-Help'),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.pagerScrollOffset')),
        m('input.FormControl', {
          type: 'number',
          min: -500,
          max: 500,
          bidi: this.setting(PREFIX + '.pagerScrollOffset'),
        }),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.pagerScrollOffset-Help')),
      ]),
      m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.pagerPreview')),
        m('.PagifySettings-preview', [
          this._pagerPreview(),
          this._iconEditor(),
        ]),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.pagerPreview-Help')),
      ]),
    ]);
  }

  _iconEditor() {
    const ICON_LABELS = {
      first: 'admin.settings.iconFirst',
      prev: 'admin.settings.iconPrev',
      next: 'admin.settings.iconNext',
      last: 'admin.settings.iconLast',
      jump: 'admin.settings.iconJump',
    };

    const key = this.iconEditing;

    if (!key || !ICON_LABELS[key]) return null;

    const settingKey = PREFIX + '.pagerIcon' + key[0].toUpperCase() + key.slice(1);
    const value = (this.setting(settingKey)() || '').trim();
    const icon = value || PAGER_ICON_DEFAULTS[key];

    return m('.PagifySettings-iconEdit', [
      m('.PagifySettings-iconEditLabel', app.translator.trans(PREFIX + '.' + ICON_LABELS[key])),
      m('.PagifySettings-iconEditRow', [
        m('i.iconEditPreview.fa-fw', { className: icon }),
        m('input.FormControl', {
          type: 'text',
          value,
          placeholder: PAGER_ICON_DEFAULTS[key],
          oninput: (e) => {
            this.setting(settingKey)(e.target.value.trim());
            m.redraw();
          },
        }),
        Button.component({
          className: 'Button',
          onclick: () => {
            this.setting(settingKey)('');
            m.redraw();
          },
        }, app.translator.trans(PREFIX + '.admin.settings.iconReset')),
        Button.component({
          className: 'Button Button--icon',
          icon: 'fas fa-times',
          title: app.translator.trans(PREFIX + '.admin.settings.iconClose'),
          'aria-label': app.translator.trans(PREFIX + '.admin.settings.iconClose'),
          onclick: () => {
            this.iconEditing = null;
            m.redraw();
          },
        }),
      ]),
    ]);
  }

  _mobileSection() {
    return this._section('admin.settings.mobile_heading', [
      this._toggle(PREFIX + '.mobileCompact', 'admin.settings.mobileCompact', 'admin.settings.mobileCompact-Help'),
      this._toggle(PREFIX + '.mobileSmall', 'admin.settings.mobileSmall', 'admin.settings.mobileSmall-Help'),
      this._flagOn(PREFIX + '.mobileSmall') && m('.Form-group', [
        m('label', app.translator.trans(PREFIX + '.admin.settings.mobileButtonSize')),
        m('input.FormControl', {
          type: 'number',
          min: 14,
          max: 60,
          bidi: this.setting(PREFIX + '.mobileButtonSize'),
        }),
        m('p.helpText', app.translator.trans(PREFIX + '.admin.settings.mobileButtonSize-Help')),
      ]),
      this._toggle(PREFIX + '.mobileHideJump', 'admin.settings.mobileHideJump', 'admin.settings.mobileHideJump-Help'),
      this._toggle(PREFIX + '.mobileHideCounter', 'admin.settings.mobileHideCounter', 'admin.settings.mobileHideCounter-Help'),
    ]);
  }

  _pagerPreview() {
    const state = {
      pageSize: 20,
      totalItems: 2000,
      getLocation: () => ({ page: 99 }),
      goto: () => Promise.resolve(),
      getPages: () => [],
    };

    return Pager.component({
      state,
      perPage: () => 20,
      trans: (key, params) => app.translator.trans(PREFIX + '.' + (MIRRORED_PREVIEW_KEYS[key] || key), params),
      mode: this.setting(PREFIX + '.pagerMode')() || 'full',
      window: this.setting(PREFIX + '.pagerWindow')(),
      counter: this._flagOn(PREFIX + '.pagerCounter'),
      jump:
        this._flagOn(PREFIX + '.pagerJumpList') ||
        this._flagOn(PREFIX + '.pagerJumpStream') ||
        this._flagOn(PREFIX + '.pagerJumpFeed'),
      buttonSize: parseInt(this.setting(PREFIX + '.pagerButtonSize')(), 10) || 36,
      icons: {
        first: (this.setting(PREFIX + '.pagerIconFirst')() || '').trim() || null,
        prev: (this.setting(PREFIX + '.pagerIconPrev')() || '').trim() || null,
        next: (this.setting(PREFIX + '.pagerIconNext')() || '').trim() || null,
        last: (this.setting(PREFIX + '.pagerIconLast')() || '').trim() || null,
        jump: (this.setting(PREFIX + '.pagerIconJump')() || '').trim() || null,
      },
      onIconClick: (key) => {
        this.iconEditing = key;
        m.redraw();
      },
      scrollSelector: '.PagifySettings',
    });
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

  // Defaults arrive as booleans until saved once.
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