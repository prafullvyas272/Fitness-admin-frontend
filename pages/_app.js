// import node module libraries
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { Analytics } from '@vercel/analytics/react';
import axios from 'axios';

//redux
import { Provider } from "react-redux";
import store from "../redux/store";


// import theme style scss file
import 'styles/theme.scss';

// import default layouts
import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

// import auth guard helpers
import { isTokenExpired, forceLogout } from 'utils/auth';

function setupAuthGuards() {
  if (typeof window === 'undefined' || window.__authGuardsInstalled) return;
  window.__authGuardsInstalled = true;

  // Catch any 401 from a plain fetch() call (most pages use this)
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    if (response.status === 401 && !url.includes('/auth/login') && localStorage.getItem('adminToken')) {
      forceLogout();
    }
    return response;
  };

  // Catch any 401 from axios calls (a few pages use this instead)
  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const url = error?.config?.url || '';
      if (error?.response?.status === 401 && !url.includes('/auth/login') && localStorage.getItem('adminToken')) {
        forceLogout();
      }
      return Promise.reject(error);
    }
  );
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const pageURL = process.env.baseURL + router.pathname;
  const title = "UPT Admin";
  const description = "Dash is a fully responsive and yet modern premium Nextjs template & snippets.";
  const keywords = "Dash UI, Nextjs, Admin, Dashboard";

  const noLayoutPages = ["/login"];

const Layout = noLayoutPages.includes(router.pathname)
  ? ({ children }) => <>{children}</>
  : DefaultDashboardLayout;

  // Force logout the moment an expired token is detected — covers opening
  // the admin panel directly (deep link / refresh) as well as idle sessions.
  useEffect(() => {
    setupAuthGuards();

    if (noLayoutPages.includes(router.pathname)) return;

    const checkExpiry = () => {
      const token = localStorage.getItem('adminToken');
      if (token && isTokenExpired(token)) forceLogout();
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [router.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

return (
  <Provider store={store}>
    <SSRProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={keywords} />
        <link rel="shortcut icon" href="https://res.cloudinary.com/dbazlbkfj/image/upload/c_pad,w_64,h_64,b_transparent/v1771390209/Layer_x0020_1_p5f6fs.png" type="image/png" />
        <link rel="icon" href="https://res.cloudinary.com/dbazlbkfj/image/upload/c_pad,w_64,h_64,b_transparent/v1771390209/Layer_x0020_1_p5f6fs.png" type="image/png" />
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
  </Provider>
);
}

export default MyApp
