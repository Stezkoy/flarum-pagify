<?php

use Flarum\Extend;
use Stezkoy\Pagify\Middleware\ConvertPostStreamNear;
use Stezkoy\Pagify\Middleware\NormalizeListLimit;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Settings())
        ->default('stezkoy-pagify.enableDiscussionList', '1')
        ->default('stezkoy-pagify.enablePostStream', '1')
        ->default('stezkoy-pagify.enablePostList', '1')
        ->default('stezkoy-pagify.perPage', 20)
        ->default('stezkoy-pagify.postsPerPage', 20)
        ->default('stezkoy-pagify.postListPerPage', 20)
        ->default('stezkoy-pagify.paginationPosition', 'under')
        ->default('stezkoy-pagify.postStreamPosition', 'both')
        ->default('stezkoy-pagify.postListPosition', 'under')
        ->default('stezkoy-pagify.pagerMode', 'full')
        ->default('stezkoy-pagify.pagerWindow', 3)
        ->default('stezkoy-pagify.pagerCounter', '')
        ->default('stezkoy-pagify.pagerJumpList', '1')
        ->default('stezkoy-pagify.pagerJumpStream', '1')
        ->default('stezkoy-pagify.pagerJumpFeed', '1')
        ->default('stezkoy-pagify.urlPage', '1')
        ->default('stezkoy-pagify.pagerButtonSize', 36)
        ->default('stezkoy-pagify.pagerScrollOffset', 80)
        ->default('stezkoy-pagify.pagerIconFirst', '')
        ->default('stezkoy-pagify.pagerIconPrev', '')
        ->default('stezkoy-pagify.pagerIconNext', '')
        ->default('stezkoy-pagify.pagerIconLast', '')
        ->default('stezkoy-pagify.pagerIconJump', '')
        ->default('stezkoy-pagify.mobileCompact', '')
        ->default('stezkoy-pagify.mobileSmall', '')
        ->default('stezkoy-pagify.mobileButtonSize', 22)
        ->default('stezkoy-pagify.mobileHideJump', '')
        ->default('stezkoy-pagify.mobileHideCounter', '')
        ->serializeToForum('stezkoyPagify.enableDiscussionList', 'stezkoy-pagify.enableDiscussionList', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.enablePostStream', 'stezkoy-pagify.enablePostStream', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.enablePostList', 'stezkoy-pagify.enablePostList', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.perPage', 'stezkoy-pagify.perPage', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.postsPerPage', 'stezkoy-pagify.postsPerPage', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.postListPerPage', 'stezkoy-pagify.postListPerPage', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.paginationPosition', 'stezkoy-pagify.paginationPosition')
        ->serializeToForum('stezkoyPagify.postStreamPosition', 'stezkoy-pagify.postStreamPosition')
        ->serializeToForum('stezkoyPagify.postListPosition', 'stezkoy-pagify.postListPosition')
        ->serializeToForum('stezkoyPagify.pagerMode', 'stezkoy-pagify.pagerMode')
        ->serializeToForum('stezkoyPagify.pagerWindow', 'stezkoy-pagify.pagerWindow', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.pagerCounter', 'stezkoy-pagify.pagerCounter', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.pagerJumpList', 'stezkoy-pagify.pagerJumpList', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.pagerJumpStream', 'stezkoy-pagify.pagerJumpStream', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.pagerJumpFeed', 'stezkoy-pagify.pagerJumpFeed', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.urlPage', 'stezkoy-pagify.urlPage', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.pagerButtonSize', 'stezkoy-pagify.pagerButtonSize', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.pagerScrollOffset', 'stezkoy-pagify.pagerScrollOffset', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.pagerIconFirst', 'stezkoy-pagify.pagerIconFirst')
        ->serializeToForum('stezkoyPagify.pagerIconPrev', 'stezkoy-pagify.pagerIconPrev')
        ->serializeToForum('stezkoyPagify.pagerIconNext', 'stezkoy-pagify.pagerIconNext')
        ->serializeToForum('stezkoyPagify.pagerIconLast', 'stezkoy-pagify.pagerIconLast')
        ->serializeToForum('stezkoyPagify.pagerIconJump', 'stezkoy-pagify.pagerIconJump')
        ->serializeToForum('stezkoyPagify.mobileCompact', 'stezkoy-pagify.mobileCompact', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.mobileSmall', 'stezkoy-pagify.mobileSmall', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.mobileButtonSize', 'stezkoy-pagify.mobileButtonSize', fn ($value) => (int) $value)
        ->serializeToForum('stezkoyPagify.mobileHideJump', 'stezkoy-pagify.mobileHideJump', fn ($value) => (bool) $value)
        ->serializeToForum('stezkoyPagify.mobileHideCounter', 'stezkoy-pagify.mobileHideCounter', fn ($value) => (bool) $value),

    // API-мiddleware: в v2 браузер получает количество страниц/элементов уже в
    // meta.page.total, поэтому никаких кастомных count/serializer не нужно —
    // достаточно подправить page[limit] списка и окно прелоада постов.
    (new Extend\Middleware('api'))
        ->add(NormalizeListLimit::class)
        ->add(ConvertPostStreamNear::class),
];