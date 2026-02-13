// import node module libraries
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { Analytics } from '@vercel/analytics/react';

// import theme style scss file
import 'styles/theme.scss';

// import default layouts
import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const pageURL = process.env.baseURL + router.pathname;
  const title = "Upto - Next.Js Admin Dashboard";
  const description = "Dash is a fully responsive and yet modern premium Nextjs template & snippets.";
  const keywords = "Dash UI, Nextjs, Admin, Dashboard";

  const noLayoutPages = ["/login"];

const Layout = noLayoutPages.includes(router.pathname)
  ? ({ children }) => <>{children}</>
  : DefaultDashboardLayout;

  return (
    <SSRProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={keywords} />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>

      <NextSeo
        title={title}
        description={description}
        canonical={pageURL}
      />

      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </SSRProvider>
  );
}

export default MyApp
