import type { EngineParams, EngineRequest, ProtocolRequest } from "graperank-nodejs/src/types"
import { json, type RequestHandler } from "@sveltejs/kit";
import { DEFAULT_CONTEXT, DEMO_CONTEXT } from "$lib/utils/const";

/**
 * GET worldview
 */
export const GET: RequestHandler = async (request) => {
  // only serve PRESET worldviews for ALL requests
  let pubkey = request.params.pubkey 
  if(!pubkey) throw('missing pubkey for worldview')
  let context = request.params.context || DEFAULT_CONTEXT
  let engineparams : any = {}
  request.url.searchParams.forEach((value,key )=>{
    engineparams[key] = value
  })

  let worldview : EngineRequest = {
    observer : pubkey,
    context : context,
    protocols : protocolpresets[context],
    params : engineparams as Partial<EngineParams>
  }

  return json(worldview)
}

const protocolpresets : Record<string,ProtocolRequest[]> = {

  [DEMO_CONTEXT] : [
    {
    protocol : "nostr-follows",
    params : {iterate : 3 }
    }
  ],

  [DEFAULT_CONTEXT] : [
    {
      protocol : "nostr-follows",
      params : {iterate : 3 }
    },
    {
      protocol : "nostr-mutes",
    },
    {
      protocol : "nostr-reports",
    }
  ],

}
