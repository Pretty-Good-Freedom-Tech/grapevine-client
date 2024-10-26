import type { Handle } from "@sveltejs/kit"


export const handle: Handle = async ({ resolve, event }) =>  {

  let response : Response | undefined;

  if (event.url.pathname.startsWith('/api/get') ) {
  if(event.request.method !== 'GET') {
    response = new Response('only GET requests permitted', { status: 500 })
    }
  }

  response = response || await resolve(event);

  return response
}