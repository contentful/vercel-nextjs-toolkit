# Vercel Next.js Toolkit for Contentful

<p>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@contentful/vercel-nextjs-toolkit">
    <img alt="" src="https://badgen.net/npm/v/@contentful/vercel-nextjs-toolkit">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=@contentful/vercel-nextjs-toolkit">
    <img alt="" src="https://img.shields.io/bundlephobia/min/%40contentful%2Fvercel-nextjs-toolkit">
  </a>
  <a aria-label="License" href="https://github.com/@contentful/vercel-nextjs-toolkit/blob/main/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/@contentful/vercel-nextjs-toolkit">
  </a>
   <a aria-label="Node.js Package status" href="(https://github.com/contentful/vercel-nextjs-toolkit/actions/workflows/release-package.yml">
    <img alt="" src="https://github.com/contentful/vercel-nextjs-toolkit/actions/workflows/release-package.yml/badge.svg">
  </a>
</p>


A toolkit of Next.js helpers that make it easier to use Contentful in a Next.js project hosted on Vercel.

This toolkit is intended as a companion to Contentful's Vercel App, a Contentful Marketplace integration that helps your content team get up and running quickly with your Vercel project powered by Contentful.

## Requirements

- Node.js v16 or later
- Next.js v13 or later

## Getting Started


Install the toolkit using npm:

```sh
npm install --production @contentful/vercel-nextjs-toolkit
```

## Usage

### Route handlers for activating Draft Mode

The toolkit provides convenient route handlers you can export from your application that allow members of your team to activate [Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode), enabling them to view unpublished content dynamically in your application.

These handlers leverage Vercel's [Protection Bypass for Automation](https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation) feature to ensure Draft Mode is only accessible when the user is authorized via this feature.

Contentful's Vercel App makes use of these handlers to provide preview URLs that can be used out of the box with Contentful's preview features for content editors.

#### App Router usage

If your NextJs project is using [App Router](https://nextjs.org/docs/app),
create a  `route.ts` or `route.js`  [route handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) file in a dedicated folder (e.g. `api/enable-draft`) inside your `app` directory:


```ts
// app/api/enable-draft/route.ts|js

export { enableDraftHandler as GET } from "@contentful/vercel-nextjs-toolkit/app-router"
```


#### Pages Router usage

If your NextJs project is using [Pages Router](https://nextjs.org/docs/pages), create an  `enable-draft.ts` or `enable-draft.js`  [API route](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) file inside the `pages/api` directory:


```ts
// pages/api/enable-draft.ts|js

export { enableDraftHandler as default } from "@contentful/vercel-nextjs-toolkit/pages-router";
```


#### Preview URL output

With these handlers installed aboves, you can construct preview URLs that activate Draft Mode and redirect the user to a desired path in your application.

Because the handlers use Vercel's [Protection Bypass for Automation](https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation) feature, you will to _enable_ Protection Bypass for Automation in your Vercel project and instrument your preview URL with the token secret.

Assuming you had a Next.js application with a route `app/blog-posts/[slug].ts`, an example preview URL might look like:

```
https://your-vercel-app.com/api/enable-draft?path=%2Fblog-posts%2Fa-day-in-my-life&x-vercel-protection-bypass=generated-vercel-secret
```

After verifying that the provided bypass secret matches the secret used in your Vercel project, the handlers above would redirect a user to:

```
https://your-vercel-app.com/blog-posts/a-day-in-my-life?x-vercel-protection-bypass=generated-vercel-secret&x-vercel-set-bypass-cookie=samesitenone
```

The values provided in the `x-vercel-*` query parameters trigger Vercel to set a cookie in a redirect response that allows future requests to bypass the cache and be served dyanmically, with Draft Mode enabled.

> [!NOTE]  
> If you install and configure Contentful's Vercel App, a preview URL similar to the above will be generated dynamically and integrated seamlessly into Contentful's [content preview](https://www.contentful.com/developers/docs/tutorials/general/content-preview/) experience for your Contentful users.

## Additional helpful resources

* To be completed

## Reach out to us

### You have questions about how to use this library?

- Reach out to our community
  forum: [![Contentful Community Forum](https://img.shields.io/badge/-Join%20Community%20Forum-3AB2E6.svg?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MiA1OSI+CiAgPHBhdGggZmlsbD0iI0Y4RTQxOCIgZD0iTTE4IDQxYTE2IDE2IDAgMCAxIDAtMjMgNiA2IDAgMCAwLTktOSAyOSAyOSAwIDAgMCAwIDQxIDYgNiAwIDEgMCA5LTkiIG1hc2s9InVybCgjYikiLz4KICA8cGF0aCBmaWxsPSIjNTZBRUQyIiBkPSJNMTggMThhMTYgMTYgMCAwIDEgMjMgMCA2IDYgMCAxIDAgOS05QTI5IDI5IDAgMCAwIDkgOWE2IDYgMCAwIDAgOSA5Ii8+CiAgPHBhdGggZmlsbD0iI0UwNTM0RSIgZD0iTTQxIDQxYTE2IDE2IDAgMCAxLTIzIDAgNiA2IDAgMSAwLTkgOSAyOSAyOSAwIDAgMCA0MSAwIDYgNiAwIDAgMC05LTkiLz4KICA8cGF0aCBmaWxsPSIjMUQ3OEE0IiBkPSJNMTggMThhNiA2IDAgMSAxLTktOSA2IDYgMCAwIDEgOSA5Ii8+CiAgPHBhdGggZmlsbD0iI0JFNDMzQiIgZD0iTTE4IDUwYTYgNiAwIDEgMS05LTkgNiA2IDAgMCAxIDkgOSIvPgo8L3N2Zz4K&maxAge=31557600)](https://support.contentful.com/)
- Jump into our community slack
  channel: [![Contentful Community Slack](https://img.shields.io/badge/-Join%20Community%20Slack-2AB27B.svg?logo=slack&maxAge=31557600)](https://www.contentful.com/slack/)

### Found a bug or want to propose a feature?

- File an issue here on GitHub: [![File an issue](https://img.shields.io/badge/-Create%20Issue-6cc644.svg?logo=github&maxAge=31557600)](https://github.com/contentful/vercel-nextjs-toolkit/issues/new).
  Make sure to remove any credentials from your code before sharing it.

### You need to share confidential information or have other questions?

- File a support ticket with Contentful Customer
  Support: [![File support ticket](https://img.shields.io/badge/-Submit%20Support%20Ticket-3AB2E6.svg?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MiA1OSI+CiAgPHBhdGggZmlsbD0iI0Y4RTQxOCIgZD0iTTE4IDQxYTE2IDE2IDAgMCAxIDAtMjMgNiA2IDAgMCAwLTktOSAyOSAyOSAwIDAgMCAwIDQxIDYgNiAwIDEgMCA5LTkiIG1hc2s9InVybCgjYikiLz4KICA8cGF0aCBmaWxsPSIjNTZBRUQyIiBkPSJNMTggMThhMTYgMTYgMCAwIDEgMjMgMCA2IDYgMCAxIDAgOS05QTI5IDI5IDAgMCAwIDkgOWE2IDYgMCAwIDAgOSA5Ii8+CiAgPHBhdGggZmlsbD0iI0UwNTM0RSIgZD0iTTQxIDQxYTE2IDE2IDAgMCAxLTIzIDAgNiA2IDAgMSAwLTkgOSAyOSAyOSAwIDAgMCA0MSAwIDYgNiAwIDAgMC05LTkiLz4KICA8cGF0aCBmaWxsPSIjMUQ3OEE0IiBkPSJNMTggMThhNiA2IDAgMSAxLTktOSA2IDYgMCAwIDEgOSA5Ii8+CiAgPHBhdGggZmlsbD0iI0JFNDMzQiIgZD0iTTE4IDUwYTYgNiAwIDEgMS05LTkgNiA2IDAgMCAxIDkgOSIvPgo8L3N2Zz4K&maxAge=31557600)](https://www.contentful.com/support/)

## License

This repository is published under the [MIT](LICENSE) license.

## Code of Conduct

We want to provide a safe, inclusive, welcoming, and harassment-free space and experience for all participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers.

[Read our full Code of Conduct](https://www.contentful.com/developers/code-of-conduct/).
