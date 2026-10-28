import { TexSvgPlugin } from '@fluxdown/lynx-plugins/plugins/tex-svg';
import { FluxdownLite } from '@fluxdown/lynx/lite';
import { root, useEffect, useState } from '@lynx-js/react';

const formulas = String.raw`Inline: $E = mc^2$ and $\frac{a}{b}$.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

$$
\begin{pmatrix}1 & 2\\3 & 4\end{pmatrix} \quad \sqrt{x^2+y^2}
$$
`;

const streamed = String.raw`Streamed: $\sum_{n=1}^{\infty}\frac{1}{n^2}=\frac{\pi^2}{6}$`;

function MathPreview() {
  const [length, setLength] = useState(0);

  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (length >= streamed.length) return;

    const timer = setTimeout(() => setLength((value) => Math.min(value + 8, streamed.length)), 80);

    return () => clearTimeout(timer);
  }, [length]);

  return (
    <scroll-view scroll-y style={{ width: '100%', height: '100vh', backgroundColor: '#e8edf5' }}>
      <view style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <text style={{ color: '#172234', fontSize: '22px', fontWeight: 'bold' }}>
          Lynx · SVG math
        </text>
        <view style={{ display: 'flex', gap: '12px' }}>
          <view
            bindtap={() => setDark((value) => !value)}
            style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px' }}
          >
            <text>Toggle theme</text>
          </view>
          <view
            bindtap={() => setLength(0)}
            style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px' }}
          >
            <text>Replay stream</text>
          </view>
        </view>
        <view
          style={{
            padding: '16px',
            backgroundColor: dark ? '#171a21' : '#ffffff',
            borderRadius: '12px',
          }}
        >
          <FluxdownLite
            text={formulas}
            theme={dark ? 'dark' : 'light'}
            build={{ tex: true }}
            plugins={TexSvgPlugin}
          />
        </view>
        <view style={{ padding: '16px', backgroundColor: '#171a21', borderRadius: '12px' }}>
          <FluxdownLite
            text={streamed.slice(0, length)}
            theme="dark"
            build={{ tex: true }}
            plugins={TexSvgPlugin}
            streaming={length < streamed.length ? { smooth: false, effect: false } : false}
          />
        </view>
        <view style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
          <FluxdownLite
            text={String.raw`Color: $\color{red}{x}+y$.

Invalid: $\notACommand{x}$

Unicode: $\text{中文}+x$`}
            build={{ tex: true }}
            plugins={TexSvgPlugin}
          />
        </view>
        <text style={{ color: '#172234', fontSize: '14px' }}>
          {length >= streamed.length ? 'Stream complete' : 'Streaming…'}
        </text>
      </view>
    </scroll-view>
  );
}

root.render(<MathPreview />);
