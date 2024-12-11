import {GrapeRank} from "graperank-nodejs/src"
import { DEMO_CONTEXT, type ApiDataTypes, type EngineRequest, type WorldviewData } from "graperank-nodejs/src/types"
import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET Scorecards 
 * @param param0 
 * @returns 
 */
export const GET: RequestHandler = async (request) => {
  let worldviewkeys = {
    observer: request.params.pubkey,
    context : request.params.context || DEMO_CONTEXT
  }
  let enginerequest : EngineRequest = {
    type : 'worldview',
    keys : worldviewkeys,
  }
  console.log("GrapeVine : requesting GrapeRank worldview : ", enginerequest)

  let worldviewdata : WorldviewData | undefined
  const graperank = new GrapeRank(enginerequest)

  console.log("GrapeVine : calling GrapeRank.get()")
  try{
    worldviewdata = await graperank.get() as WorldviewData
    if(worldviewdata) {
      console.log("GrapeVine : retrieved GrapeRank worldview ")
    }else{
      throw("GrapeVine : no results")
    }
    console.log()
  }catch(e){
    console.log("GrapeVine : GrapeRank ERROR : ", e)
  }

  return json({
    keys : worldviewkeys, 
    data : worldviewdata,
  })
}
