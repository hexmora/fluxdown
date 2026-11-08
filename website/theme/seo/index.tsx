import {
  Head,
  normalizeHref,
  useHead,
  usePage,
  usePages,
  useSite,
  withBase,
  withSiteOrigin,
} from '@rspress/core/runtime';

export const SeoHead = () => {
  const { page } = usePage();
  const { pages } = usePages();
  const { site } = useSite();

  const pureRoutePath = (entry: Pick<typeof page, 'routePath' | 'lang' | 'version'>) => {
    const parts = normalizeHref(entry.routePath, false).split('/').filter(Boolean);
    if (entry.version && entry.version !== site.multiVersion.default) parts.shift();
    if (entry.lang && entry.lang !== site.lang) parts.shift();
    return parts.join('/');
  };
  const currentPath = pureRoutePath(page);
  const alternates =
    page.pageType === '404'
      ? []
      : site.locales.flatMap(({ lang }) => {
          const translated = pages.find(
            (candidate) =>
              candidate.lang === lang &&
              candidate.version === page.version &&
              pureRoutePath(candidate) === currentPath,
          );
          return translated
            ? [
                {
                  rel: 'alternate',
                  hreflang: lang.replaceAll('_', '-'),
                  href: withSiteOrigin(withBase(normalizeHref(translated.routePath, false))),
                },
              ]
            : [];
        });

  // Rspress emits hreflang during SSG; Unhead adopts those tags for client navigation.
  useHead({ link: alternates.length > 1 ? alternates : [] }, { mode: 'client' });

  if (page.pageType === '404') return null;

  const canonical = withSiteOrigin(withBase(normalizeHref(page.routePath, false)));

  // Article titles already include the brand. Rspress otherwise appends it again.
  const { frontmatter } = page;
  const articleTitle =
    (page.pageType === 'doc' || page.pageType === 'doc-wide') && (frontmatter.title ?? page.title);
  const brandedTitle =
    articleTitle && /\b(?:Fluxdown|Stative)\b/.test(articleTitle) && articleTitle;

  // Rspress 2.0 uses the site title for custom pages, ignoring their frontmatter title.
  const customTitle =
    (page.pageType === 'custom' || page.pageType === 'blank') && frontmatter.title;
  const suffix = frontmatter.titleSuffix ?? site.title;
  const title =
    brandedTitle || (customTitle && (suffix ? `${customTitle} - ${suffix}` : customTitle));

  return (
    <Head>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
    </Head>
  );
};
