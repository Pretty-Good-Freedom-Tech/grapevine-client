import {GrapeRank} from "graperank-nodejs/src"
import type { EngineRequest, Scorecard } from "graperank-nodejs/src/types"
import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GET Scorecards 
 * @param param0 
 * @returns 
 */
export const GET: RequestHandler = async (request) => {
  let address = request.params.context ? request.params.pubkey+'/'+request.params.context : request.params.pubkey

  let worldview : EngineRequest = 
  await request.fetch( '/api/get/worldview/'+address)
    .then( (r) => r.json())

  let scorecards : Scorecard[] | undefined 
  
  // if(!req.protocols) throw("missing `protocols` object required in request")
  // if(!req.params) req.params = {}
  console.log("GrapeVine : instantiating GrapeRank with worldview : ", worldview)

  const graperank = new GrapeRank(worldview,false)
  
  const starttime = Date.now()
  console.log("GrapeVine : calling GrapeRank.get()")
  try{
    scorecards = await graperank.get()
    if(scorecards){
      console.log("GrapeVine : GrapeRank complete with ", scorecards?.length || 0, " records")
    }else{
      throw("GrapeVine : no results")
    }
    console.log()
  }catch(e){
    console.log("GrapeVine : GrapeRank ERROR : ", e)
  }

  const endtime = Date.now()
  console.log("GrapeVine : elapsed time = ",(endtime - starttime) * .001," seconds")

  return json(scorecards)
}
