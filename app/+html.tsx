import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>WorkGo</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *,
              *::before,
              *::after {
                -webkit-tap-highlight-color: transparent !important;
              }
              a:focus,
              button:focus,
              div:focus,
              [role="button"]:focus {
                outline: none !important;
              }
              ::selection {
                background: transparent;
              }
            `,
          }}
        />
      </head>
      <body>
        <ScrollViewStyleReset />
        {children}
      </body>
    </html>
  );
}