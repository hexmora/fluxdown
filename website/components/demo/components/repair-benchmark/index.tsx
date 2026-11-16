import { useId } from 'react';

import data from '../../../../benchmark/repair.json';
import { useLocale } from '../../../hooks';
import { CATEGORIES, COPY } from './consts';
import styles from './index.module.scss';

export const RepairBenchmark = () => {
  const { lang } = useLocale();
  const captionId = useId();
  const labels = COPY[lang];
  const rows = [
    {
      category: labels.all,
      cases: data.meta.cases,
      rates: data.libraries.map((library) => library.metrics.jumpFrameRate),
    },
    ...data.libraries[0].categories.map((item, index) => ({
      category: CATEGORIES[lang][item.category] ?? item.category,
      cases: item.cases,
      rates: data.libraries.map((library) => library.categories[index].jumpFrameRate),
    })),
  ];

  return (
    <>
      <p>
        {lang === 'zh'
          ? `${data.meta.cases.toLocaleString('en-US')} 个样例，${data.meta.categories.length} 类语法；逐字输入，在 JSDOM 中比较每次更新稳定后的语义结构，不含公式。表头为各库的 npm 版本。`
          : `${data.meta.cases.toLocaleString('en-US')} cases across ${data.meta.categories.length} syntax categories; character-by-character input, comparing settled semantic structure in JSDOM. Formulas are excluded. Headers show npm package versions.`}
      </p>
      <figure className={`${styles.benchmark} rp-not-doc`} data-demo="repair-benchmark">
        <figcaption id={captionId}>{labels.title}</figcaption>
        <div className={styles.frame}>
          <div className={styles.scroll}>
            <table className={styles.table} aria-labelledby={captionId}>
              <thead>
                <tr>
                  <th scope="col">{labels.category}</th>
                  <th scope="col">{labels.cases}</th>
                  {data.libraries.map((library) => (
                    <th key={library.id} scope="col">
                      {library.name}
                      <small>{library.version}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={row.category} className={rowIndex === 0 ? styles.overall : undefined}>
                    <th scope="row">{row.category}</th>
                    <td>{row.cases}</td>
                    {data.libraries.map((library, index) => (
                      <td key={library.id} data-best={row.rates[index] === Math.min(...row.rates)}>
                        {(row.rates[index] * 100).toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </figure>
    </>
  );
};
