import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import 'mathjax-full/js/input/tex/action/ActionConfiguration.js';
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js';
import 'mathjax-full/js/input/tex/amscd/AmsCdConfiguration.js';
import 'mathjax-full/js/input/tex/bbox/BboxConfiguration.js';
import 'mathjax-full/js/input/tex/boldsymbol/BoldsymbolConfiguration.js';
import 'mathjax-full/js/input/tex/braket/BraketConfiguration.js';
import 'mathjax-full/js/input/tex/bussproofs/BussproofsConfiguration.js';
import 'mathjax-full/js/input/tex/cancel/CancelConfiguration.js';
import 'mathjax-full/js/input/tex/cases/CasesConfiguration.js';
import 'mathjax-full/js/input/tex/centernot/CenternotConfiguration.js';
import 'mathjax-full/js/input/tex/color/ColorConfiguration.js';
import 'mathjax-full/js/input/tex/colortbl/ColortblConfiguration.js';
import 'mathjax-full/js/input/tex/configmacros/ConfigMacrosConfiguration.js';
import 'mathjax-full/js/input/tex/empheq/EmpheqConfiguration.js';
import 'mathjax-full/js/input/tex/enclose/EncloseConfiguration.js';
import 'mathjax-full/js/input/tex/extpfeil/ExtpfeilConfiguration.js';
import 'mathjax-full/js/input/tex/gensymb/GensymbConfiguration.js';
import 'mathjax-full/js/input/tex/html/HtmlConfiguration.js';
import 'mathjax-full/js/input/tex/mathtools/MathtoolsConfiguration.js';
import 'mathjax-full/js/input/tex/mhchem/MhchemConfiguration.js';
import 'mathjax-full/js/input/tex/newcommand/NewcommandConfiguration.js';
import 'mathjax-full/js/input/tex/physics/PhysicsConfiguration.js';
import 'mathjax-full/js/input/tex/tagformat/TagFormatConfiguration.js';
import 'mathjax-full/js/input/tex/textcomp/TextcompConfiguration.js';
import 'mathjax-full/js/input/tex/textmacros/TextMacrosConfiguration.js';
import 'mathjax-full/js/input/tex/upgreek/UpgreekConfiguration.js';
import 'mathjax-full/js/input/tex/unicode/UnicodeConfiguration.js';
import 'mathjax-full/js/input/tex/verb/VerbConfiguration.js';

interface Formula {
  svg: string;

  width: number;

  height: number;
}

const texPackages = [
  'base',
  'action',
  'ams',
  'amscd',
  'bbox',
  'boldsymbol',
  'braket',
  'bussproofs',
  'cancel',
  'cases',
  'centernot',
  'color',
  'colortbl',
  'empheq',
  'enclose',
  'extpfeil',
  'gensymb',
  'html',
  'mathtools',
  'mhchem',
  'newcommand',
  'upgreek',
  'unicode',
  'verb',
  'configmacros',
  'tagformat',
  'textcomp',
  'textmacros',
  'physics',
];

const adaptor = liteAdaptor();

SafeHandler(RegisterHTMLHandler(adaptor));

export const renderFormula = (
  source: string,
  mode: 'inline' | 'display',
  color: string,
): Formula | null => {
  try {
    // A fresh input context prevents one formula's macros from leaking into the next.
    const document = mathjax.document('', {
      InputJax: new TeX({
        packages: texPackages,
        maxBuffer: 32 * 1024,
        maxMacros: 1000,
        macros: {
          equalparallel:
            '{\\lower{2.6pt}{\\arrowvert\\hspace{-4.2pt}\\arrowvert}\\above{-2pt}\\raise{7.5pt}{=}}',
          number: ['{#1}', 1],
          unit: ['{#1}', 1],
          div: '{÷}',
        },
        formatError: (_jax: unknown, error: Error) => {
          throw error;
        },
      }),
      OutputJax: new SVG({
        fontCache: 'none',
      }),
      safeOptions: {
        allow: { URLs: 'none', classes: 'none', cssIDs: 'none', styles: 'none' },
      },
    });

    const tex = source.replace(/\p{Cc}/gu, (character) =>
      character === '\n' || character === '\t' ? character : '',
    );

    const node = document.convert(tex, {
      display: mode === 'display',
      em: 16,
      ex: 8,
    });

    const svg = adaptor.tags(node, 'svg')[0];

    if (
      !svg ||
      adaptor.tags(svg, 'g').some((child) => adaptor.hasAttribute(child, 'data-mjx-error'))
    ) {
      return null;
    }

    const [, , width, height] = adaptor.getAttribute(svg, 'viewBox').split(/\s+/).map(Number);

    // Native SVG does not inherit the surrounding Lynx text color.
    adaptor.setAttribute(svg, 'color', color);

    adaptor.removeAttribute(svg, 'style');

    adaptor.setAttribute(svg, 'width', String(width));

    adaptor.setAttribute(svg, 'height', String(height));

    // Return em ratios so Lynx can size formulas with the surrounding text.
    return {
      svg: adaptor.outerHTML(svg).replace(/\sdata-[\w-]+=(?:"[^"]*"|'[^']*')/g, ''),
      width: width / 1000,
      height: height / 1000,
    };
  } catch {
    return null;
  }
};
