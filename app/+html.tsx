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
                -webkit-touch-callout: none !important;
              }
              html, body {
                overscroll-behavior: none !important;
                overscroll-behavior-y: none !important;
              }
              *:focus,
              *:focus-visible,
              *:active,
              a:focus,
              button:focus,
              div:focus,
              [role="button"]:focus,
              [tabindex]:focus {
                outline: none !important;
                outline-width: 0 !important;
                outline-color: transparent !important;
                box-shadow: none !important;
              }
              ::selection {
                background: transparent;
              }
              ::-webkit-scrollbar {
                display: none;
                width: 0;
                height: 0;
              }
              * {
                scrollbar-width: none;
                -ms-overflow-style: none;
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