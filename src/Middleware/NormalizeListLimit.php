<?php

namespace Stezkoy\Pagify\Middleware;

use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

/**
 * Inject page[limit] = perPage into /discussions requests that carry none,
 * so the preloaded first page matches the configured list page size.
 * perPage applies whether the pager or the "Load more" behaviour is active.
 */
class NormalizeListLimit implements MiddlewareInterface
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function process(Request $request, Handler $handler): Response
    {
        // Only server-side preloads are rewritten; external API clients keep
        // core's own defaults whenever they omit a page size.
        if ($request->getMethod() === 'GET'
            && RequestUtil::isInternal($request)
            && preg_match('#/discussions/?$#', $request->getUri()->getPath())
        ) {
            $perPage = min(50, max(1, (int) ($this->settings->get('stezkoy-pagify.perPage') ?: 20)));

            $params = $request->getQueryParams();

            if (! isset($params['page']['limit'])) {
                $params['page']['limit'] = $perPage;
                $request = $request->withQueryParams($params);
            }
        }

        return $handler->handle($request);
    }
}