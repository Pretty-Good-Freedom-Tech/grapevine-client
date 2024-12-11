import {GrapeRank} from "graperank-nodejs/src"
import { DEMO_CONTEXT, type ApiDataTypes, type EngineRequest, type Scorecard, type ScorecardsRecord } from "graperank-nodejs/src/types"
import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET Scorecards 
 * @param param0 
 * @returns 
 */
export const GET: RequestHandler = async (request) => {

  let recalculate = request.url.searchParams.has('recalculate')

  let enginerequest : EngineRequest = {
    type : 'scorecards',
    keys : {
      observer: request.params.pubkey,
      context : request.params.context || DEMO_CONTEXT
    },
    
  }

  // let scorecards : Scorecard[] | undefined 
  
  // if(!req.protocols) throw("missing `protocols` object required in request")
  // if(!req.params) req.params = {}
  console.log("GrapeVine : instantiating GrapeRank with request : ", enginerequest, recalculate)

  let graperankdata : ApiDataTypes | undefined
  const graperank = new GrapeRank(enginerequest, recalculate)
  const starttime = Date.now()
  console.log("GrapeVine : calling GrapeRank.get()")
  try{
    graperankdata = await graperank.get() as ScorecardsRecord
    if(graperankdata) {
      console.log("GrapeVine : GrapeRank complete with ", Object.keys(graperankdata).length || 0, " records")
    }else{
      throw("GrapeVine : no results")
    }
    console.log()
  }catch(e){
    console.log("GrapeVine : GrapeRank ERROR : ", e)
  }

  const endtime = Date.now()
  console.log("GrapeVine : elapsed time = ",(endtime - starttime) * .001," seconds")

  return json(graperankdata)
}
