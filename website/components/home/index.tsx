import { withBase } from '@rspress/core/runtime';
import { CodeBlockRuntime, Link } from '@rspress/core/theme';

import { CopyButton } from '../copy-button';
import { FrameworkCodeTabs, useCodeFramework } from '../framework-code-tabs';
import { useLocale } from '../hooks';
import { ArrowIcon } from '../icons';
import { FeatureIcon, StreamingDemo } from './components';
import { COPY, INSTALL_COMMAND } from './consts';
import styles from './index.module.scss';
import { getQuickStarts } from './utils';

export const Home = () => {
  const { lang, href } = useLocale();

  const copy = COPY[lang];

  const quickStarts = getQuickStarts(copy.codeComment);

  const [framework] = useCodeFramework();

  const quickStart =
    quickStarts.find((example) => example.framework === framework) ?? quickStarts[0];

  return (
    <main className={styles.home}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <h1 id="hero-title">
          Fluxdown<span aria-hidden="true">.</span>
        </h1>
        <p className={styles.description}>
          {copy.description}
          <br />
          {copy.qualities}
        </p>
        <div className={styles.install}>
          <span aria-hidden="true" className={styles.prompt}>
            $
          </span>
          <code>{INSTALL_COMMAND}</code>
          <CopyButton label={copy.install} value={INSTALL_COMMAND} />
        </div>
      </section>

      <StreamingDemo key={lang} />

      <section className={styles.features} aria-labelledby="features-title">
        <div className={styles.sectionHeading}>
          <h2 id="features-title">{copy.featuresTitle}</h2>
          <p>{copy.featuresDescription}</p>
        </div>
        <div className={styles.featureGrid}>
          {copy.features.map((feature, index) => (
            <article key={feature.path + feature.title} className={styles.feature}>
              <div className={styles.featureIcon}>
                <FeatureIcon index={index} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link href={href(feature.path)}>
                {feature.link}
                <ArrowIcon />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.quickStart} aria-labelledby="quick-title">
        <div className={styles.sectionHeading}>
          <h2 id="quick-title">{copy.quickTitle}</h2>
          <p>{copy.quickDescription}</p>
        </div>
        <div className={styles.codeCard}>
          <FrameworkCodeTabs frameworks={quickStarts.map((example) => example.framework)}>
            {quickStarts.map((example) => (
              <CodeBlockRuntime
                code={example.code}
                key={example.framework}
                lang={example.lang}
                wrapCode
              />
            ))}
          </FrameworkCodeTabs>
        </div>
        <Link className={styles.textLink} href={href(`/guide/${quickStart.renderer}/quick-start`)}>
          {copy.quickLink}
          <ArrowIcon />
        </Link>
      </section>

      <section className={styles.architecture} aria-labelledby="architecture-title">
        <div className={styles.sectionHeading}>
          <h2 id="architecture-title">{copy.architectureTitle}</h2>
          <p>{copy.architectureDescription}</p>
        </div>
        <div className={styles.diagram}>
          <div className={styles.renderers}>
            <Link className={styles.frameworkCard} href={href('/guide/react/quick-start')}>
              <strong>React</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/vue/quick-start')}>
              <strong>Vue 3</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/svelte/quick-start')}>
              <strong>Svelte</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/angular/quick-start')}>
              <strong>Angular</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/react-native/quick-start')}>
              <strong>React Native</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/lynx/quick-start')}>
              <strong>Lynx</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/solid/quick-start')}>
              <strong>Solid</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/taro/quick-start')}>
              <strong>Taro</strong>
              <span>{copy.react}</span>
            </Link>
            <Link className={styles.frameworkCard} href={href('/guide/uni-app/quick-start')}>
              <strong>uni-app</strong>
              <span>{copy.react}</span>
            </Link>
          </div>
          <div className={styles.branch} aria-hidden="true" />
          <Link
            aria-labelledby="core-label core-description"
            className={styles.layerCard}
            href={href('/guide/core/quick-start')}
          >
            <img alt="" src={withBase('/logo.svg')} width="25" height="32" />
            <div>
              <strong id="core-label">Fluxdown Core</strong>
              <span id="core-description">{copy.core}</span>
            </div>
            <ArrowIcon />
          </Link>
          <div className={styles.connector} aria-hidden="true" />
          <Link
            aria-labelledby="stative-label stative-description"
            className={styles.layerCard}
            href={href('/stative/')}
          >
            <span className={styles.stativeMark} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <div>
              <strong id="stative-label">Stative</strong>
              <span id="stative-description">{copy.foundation}</span>
            </div>
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className={styles.organizations} aria-labelledby="organizations-title">
        <h2 id="organizations-title">{copy.organizationsTitle}</h2>
        <div className={styles.organizationLogos}>
          <img alt="Today" height="35" src={withBase('/today.svg')} width="120" />
        </div>
        <p>
          {copy.organizationsNote}{' '}
          <a href="https://github.com/hexmora/fluxdown/issues">{copy.organizationsLink}</a>
        </p>
      </section>

      <section className={styles.closing}>
        <h2>{copy.finalTitle}</h2>
        <Link className={styles.primaryLink} href={href('/guide/react/quick-start')}>
          {copy.finalButton}
          <ArrowIcon />
        </Link>
      </section>

      <footer className={styles.footer}>
        <span>{copy.footer}</span>
        <div>
          <a href="https://github.com/hexmora/fluxdown">GitHub</a>
          <span>MIT License</span>
        </div>
      </footer>
    </main>
  );
};
