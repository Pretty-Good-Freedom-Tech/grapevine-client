import { DEMO_CONTEXT, type Scorecard, type ScorecardsRecord, type Worldview, type WorldviewData, type WorldviewKeys } from "graperank-nodejs/src/types";


export async function fetchWorldview(pubkey : string, context? : string) : Promise<Worldview | undefined>{
  console.log('grapevine getScorecards() params : ',pubkey,context)
  context = context || DEMO_CONTEXT
  let worldview : Worldview | undefined
  await fetch('/api/get/worldview/'+pubkey+'/'+context )
    .then(async r => {
      console.log('grapevine fetchWorldview() : fetched from api')
      let { keys, data } : {keys : WorldviewKeys, data : WorldviewData} = await r.json()
      worldview = {...keys, ...data, context : keys.context || context}
    }).catch((e) => {
      console.log('GrapeVine : fetchWorldview() : fetch from api failed : ',e)
    })
    return worldview
}

export async function fetchScorecards(pubkey : string, context? : string, recalculate? : boolean) : Promise<Scorecard[] | undefined>{
  console.log('grapevine getScorecards() params : ',pubkey,context)
  context = context || DEMO_CONTEXT
  let query = recalculate ? 'recalculate' : ''
  let scorecards : Scorecard[] = []
  await fetch('/api/get/scorecards/'+pubkey+'/'+context+'?'+query )
    .then(async r => {
      console.log('grapevine getScorecards() : fetched from api')
      let data = await r.json() as ScorecardsRecord
      if(data) for(let userid in data) {
        scorecards.push({  subject : userid,  ...data[userid]  })
      }
    }).catch((e) => {
      console.log('GrapeVine : getScorecards() : fetch from api failed : ',e)
    })
    return scorecards
}

export type scorecardsummary = {min:number, max:number, count:number}[]
export function countScorecardsByScore(scorecards : Scorecard[], increment = .1, max = 1) : scorecardsummary {
  const count : scorecardsummary = []
  let min = max
  while(min > 0){
    min = min - increment
    console.log('GrapeVine : calling filterScorecardsByScore() : called with min/max : ',min, max, scorecards.length)
    let filtered = filterScorecardsByScore(scorecards, min, max)
    if(filtered.length)
    count.push({
      min, max,
      count : filtered.length
    })
    max = min
  }
  return count
}

export function filterScorecardsByScore(scorecards : Scorecard[], min : number, max :number, slice? : [number, number]) : Scorecard[]{
  const filtered = scorecards.filter((scorecard)=>{
    if(scorecard.score === undefined) return false
    let match = false
    if(scorecard.score >= min) match = true
    if(scorecard.score > max) match = false
    return match
  })
  return slice ? filtered.slice(...slice) : filtered
}

