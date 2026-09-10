<?php

namespace Stezkoy\Pagify\Middleware;

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
        if ($request->getMethod() === 'GET'
            && preg_match('#/discussions/?$#', $request->getUri()->getPath())
        ) {
            $perPage = (int) ($this->settings->get('stezkoy-pagify.perPage') ?: 20);

            $params = $request->getQueryParams();

            if (! isset($params['page']['limit'])) {
                $params['page']['limit'] = $perPage;
                $request = $request->withQueryParams($params);
            }
        }

        return $handler->handle($request);
    }
}